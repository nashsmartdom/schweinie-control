from __future__ import annotations

from homeassistant.components.select import SelectEntity
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
    async_add_entities([SchweinieRepeatsSelect(entry.entry_id, data)])


class SchweinieRepeatsSelect(SelectEntity):
    _attr_has_entity_name = True
    _attr_name = "Wiederholungen"
    _attr_unique_id = "schweinie_control_repeats"
    _attr_options = ["1", "2", "3"]

    def __init__(self, entry_id: str, data: SchweinieRuntimeData) -> None:
        self._entry_id = entry_id
        self._data = data
        self.entity_id = "select.schweinie_control_repeats"

    @property
    def device_info(self) -> DeviceInfo:
        return DeviceInfo(
            identifiers={(DOMAIN, self._entry_id)},
            name="Schweinie Control",
            manufacturer="Schweinie Control",
        )

    @property
    def current_option(self) -> str:
        return str(self._data.repeats)

    async def async_select_option(self, option: str) -> None:
        self._data.repeats = int(option)
        self.async_write_ha_state()

    @property
    def extra_state_attributes(self):
        return {"schweinie_control_entry_id": self._entry_id}
