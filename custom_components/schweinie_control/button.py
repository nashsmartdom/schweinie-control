from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from . import SchweinieRuntimeData


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    data: SchweinieRuntimeData = hass.data[DOMAIN][entry.entry_id]
    async_add_entities(
        [
            SchweinieCleanSelectedButton(entry.entry_id, data, hass),
            SchweinieResetSelectionButton(entry.entry_id, data, hass),
        ]
    )


class SchweinieBaseButton(ButtonEntity):
    _attr_has_entity_name = True

    def __init__(self, entry_id: str, data: SchweinieRuntimeData, hass: HomeAssistant) -> None:
        self._entry_id = entry_id
        self._data = data
        self.hass = hass

    @property
    def device_info(self) -> DeviceInfo:
        return DeviceInfo(
            identifiers={(DOMAIN, self._entry_id)},
            name="Schweinie Control",
            manufacturer="Schweinie Control",
        )

    @property
    def extra_state_attributes(self):
        return {"schweinie_control_entry_id": self._entry_id}


class SchweinieCleanSelectedButton(SchweinieBaseButton):
    _attr_name = "Auswahl reinigen"
    _attr_unique_id = "schweinie_control_clean_selected"
    _attr_icon = "mdi:robot-vacuum"

    def __init__(self, entry_id: str, data: SchweinieRuntimeData, hass: HomeAssistant) -> None:
        super().__init__(entry_id, data, hass)
        self.entity_id = "button.schweinie_control_clean_selected"

    async def async_press(self) -> None:
        await self.hass.services.async_call(
            DOMAIN,
            "clean_rooms",
            {},
            blocking=True,
        )


class SchweinieResetSelectionButton(SchweinieBaseButton):
    _attr_name = "Auswahl löschen"
    _attr_unique_id = "schweinie_control_reset_selection"
    _attr_icon = "mdi:selection-remove"

    def __init__(self, entry_id: str, data: SchweinieRuntimeData, hass: HomeAssistant) -> None:
        super().__init__(entry_id, data, hass)
        self.entity_id = "button.schweinie_control_reset_selection"

    async def async_press(self) -> None:
        await self.hass.services.async_call(
            DOMAIN,
            "reset_selection",
            {},
            blocking=True,
        )
