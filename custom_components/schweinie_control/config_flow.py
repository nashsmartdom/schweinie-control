from __future__ import annotations

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.helpers import selector

from .const import (
    CONF_CUSTOMIZED_CLEANING_SWITCH,
    CONF_VACUUM_ENTITY,
    DEFAULT_CUSTOMIZED_CLEANING_SWITCH,
    DEFAULT_VACUUM_ENTITY,
    DOMAIN,
)


class SchweinieControlConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input=None):
        errors = {}

        if user_input is not None:
            await self.async_set_unique_id("schweinie_control")
            self._abort_if_unique_id_configured()
            return self.async_create_entry(title="Schweinie Control", data=user_input)

        schema = vol.Schema(
            {
                vol.Required(CONF_VACUUM_ENTITY, default=DEFAULT_VACUUM_ENTITY): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="vacuum")
                ),
                vol.Required(
                    CONF_CUSTOMIZED_CLEANING_SWITCH,
                    default=DEFAULT_CUSTOMIZED_CLEANING_SWITCH,
                ): selector.EntitySelector(selector.EntitySelectorConfig(domain="switch")),
            }
        )

        return self.async_show_form(
            step_id="user",
            data_schema=schema,
            errors=errors,
        )
