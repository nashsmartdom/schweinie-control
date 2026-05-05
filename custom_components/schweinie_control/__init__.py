from __future__ import annotations

from dataclasses import dataclass, field
import logging
from pathlib import Path
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers.entity_component import async_update_entity

from .const import (
    CONF_CUSTOMIZED_CLEANING_SWITCH,
    CONF_VACUUM_ENTITY,
    DEFAULT_CUSTOMIZED_CLEANING_SWITCH,
    DEFAULT_VACUUM_ENTITY,
    DOMAIN,
    PLATFORMS,
    ROOMS,
)

_LOGGER = logging.getLogger(__name__)

CARD_URL = f"/{DOMAIN}/schweinie-control-card.js"
CARD_FILE = Path(__file__).parent / "www" / "schweinie-control-card.js"
FRONTEND_REGISTERED = "_frontend_registered"


@dataclass
class SchweinieRuntimeData:
    vacuum_entity: str
    customized_cleaning_switch: str
    selected_rooms: set[int] = field(default_factory=set)
    repeats: int = 1

    @property
    def selected_room_names(self) -> list[str]:
        return [ROOMS[room_id] for room_id in sorted(self.selected_rooms) if room_id in ROOMS]

    def reset_selection(self) -> None:
        self.selected_rooms.clear()


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    domain_data = hass.data.setdefault(DOMAIN, {})
    await _async_register_frontend(hass, domain_data)

    data = SchweinieRuntimeData(
        vacuum_entity=entry.data.get(CONF_VACUUM_ENTITY, DEFAULT_VACUUM_ENTITY),
        customized_cleaning_switch=entry.data.get(
            CONF_CUSTOMIZED_CLEANING_SWITCH, DEFAULT_CUSTOMIZED_CLEANING_SWITCH
        ),
    )

    domain_data[entry.entry_id] = data

    async def clean_rooms(call: ServiceCall) -> None:
        rooms = _parse_rooms(call.data.get("rooms")) or sorted(data.selected_rooms)
        repeats = int(call.data.get("repeats", data.repeats))

        if not rooms:
            await hass.services.async_call(
                "persistent_notification",
                "create",
                {
                    "title": "Schweinie",
                    "message": "Keine Zimmer ausgewählt.",
                },
                blocking=False,
            )
            return

        if hass.states.is_state(data.customized_cleaning_switch, "on"):
            await hass.services.async_call(
                "switch",
                "turn_off",
                {"entity_id": data.customized_cleaning_switch},
                blocking=True,
            )

        _LOGGER.info("Clean rooms requested: rooms=%s repeats=%s", rooms, repeats)

        await hass.services.async_call(
            "dreame_vacuum",
            "vacuum_clean_segment",
            {
                "entity_id": data.vacuum_entity,
                "segments": rooms,
                "repeats": repeats,
            },
            blocking=True,
        )

    async def reset_selection(call: ServiceCall) -> None:
        data.reset_selection()
        await _async_refresh_entities(hass, entry.entry_id)

    if not hass.services.has_service(DOMAIN, "clean_rooms"):
        hass.services.async_register(DOMAIN, "clean_rooms", clean_rooms)
    if not hass.services.has_service(DOMAIN, "reset_selection"):
        hass.services.async_register(DOMAIN, "reset_selection", reset_selection)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id, None)
    return unload_ok


async def _async_register_frontend(hass: HomeAssistant, domain_data: dict[str, Any]) -> None:
    if domain_data.get(FRONTEND_REGISTERED):
        return

    if not CARD_FILE.exists():
        _LOGGER.warning("Schweinie Control card file not found: %s", CARD_FILE)
        return

    try:
        from homeassistant.components.http import StaticPathConfig

        await hass.http.async_register_static_paths(
            [StaticPathConfig(CARD_URL, str(CARD_FILE), True)]
        )
    except Exception as err:  # pragma: no cover - compatibility fallback
        try:
            hass.http.register_static_path(CARD_URL, str(CARD_FILE), True)
        except Exception:
            _LOGGER.debug("Frontend path already registered or unavailable: %s", err)

    domain_data[FRONTEND_REGISTERED] = True
    _LOGGER.info("Schweinie Control card available at %s", CARD_URL)


def _parse_rooms(value: Any) -> list[int]:
    if value is None:
        return []
    if isinstance(value, str):
        value = value.strip()
        if not value:
            return []
        return [int(part.strip()) for part in value.split(",") if part.strip()]
    if isinstance(value, (list, tuple, set)):
        return [int(item) for item in value]
    return [int(value)]


async def _async_refresh_entities(hass: HomeAssistant, entry_id: str) -> None:
    entity_registry = []
    for state in hass.states.async_all():
        attrs = state.attributes
        if attrs.get("schweinie_control_entry_id") == entry_id:
            entity_registry.append(state.entity_id)
    for entity_id in entity_registry:
        await async_update_entity(hass, entity_id)
