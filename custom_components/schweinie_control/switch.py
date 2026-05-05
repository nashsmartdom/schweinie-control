from __future__ import annotations

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, ROOMS
from . import SchweinieRuntimeData


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    data: SchweinieRuntimeData = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([SchweinieRoomSwitch(entry.entry_id, data, room_id, name) for room_id, name in ROOMS.items()])


class SchweinieRoomSwitch(SwitchEntity):
    _attr_has_entity_name = True

    def __init__(self, entry_id: str, data: SchweinieRuntimeData, room_id: int, room_name: str) -> None:
        self._entry_id = entry_id
        self._data = data
        self._room_id = room_id
        self._room_name = room_name
        slug = room_name.lower().replace(" ", "_").replace("ü", "ue")
        self._attr_unique_id = f"schweinie_control_room_{room_id}"
        self._attr_name = room_name
        self.entity_id = f"switch.schweinie_room_{slug}"

    @property
    def device_info(self) -> DeviceInfo:
        return DeviceInfo(
            identifiers={(DOMAIN, self._entry_id)},
            name="Schweinie Control",
            manufacturer="Schweinie Control",
        )

    @property
    def extra_state_attributes(self):
        return {
            "room_id": self._room_id,
            "room_name": self._room_name,
            "schweinie_control_entry_id": self._entry_id,
        }

    @property
    def is_on(self) -> bool:
        return self._room_id in self._data.selected_rooms

    async def async_turn_on(self, **kwargs) -> None:
        self._data.selected_rooms.add(self._room_id)
        self.async_write_ha_state()

    async def async_turn_off(self, **kwargs) -> None:
        self._data.selected_rooms.discard(self._room_id)
        self.async_write_ha_state()
