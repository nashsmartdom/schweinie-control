from __future__ import annotations

from homeassistant.components.sensor import SensorEntity
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
    async_add_entities([SchweinieSelectedRoomsSensor(entry.entry_id, data)])


class SchweinieSelectedRoomsSensor(SensorEntity):
    _attr_has_entity_name = True
    _attr_name = "Ausgewählte Zimmer"
    _attr_unique_id = "schweinie_control_selected_rooms"

    def __init__(self, entry_id: str, data: SchweinieRuntimeData) -> None:
        self._entry_id = entry_id
        self._data = data
        self.entity_id = "sensor.schweinie_control_selected_rooms"

    @property
    def device_info(self) -> DeviceInfo:
        return DeviceInfo(
            identifiers={(DOMAIN, self._entry_id)},
            name="Schweinie Control",
            manufacturer="Schweinie Control",
        )

    @property
    def native_value(self) -> str:
        if not self._data.selected_rooms:
            return "Keine"
        return ", ".join(self._data.selected_room_names)

    @property
    def extra_state_attributes(self):
        return {
            "selected_room_ids": sorted(self._data.selected_rooms),
            "selected_room_names": self._data.selected_room_names,
            "count": len(self._data.selected_rooms),
            "repeats": self._data.repeats,
            "schweinie_control_entry_id": self._entry_id,
        }
