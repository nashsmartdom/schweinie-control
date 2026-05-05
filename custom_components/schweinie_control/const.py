DOMAIN = "schweinie_control"

DEFAULT_VACUUM_ENTITY = "vacuum.schweinie"
DEFAULT_CUSTOMIZED_CLEANING_SWITCH = "switch.schweinie_customized_cleaning"

CONF_VACUUM_ENTITY = "vacuum_entity"
CONF_CUSTOMIZED_CLEANING_SWITCH = "customized_cleaning_switch"

# Room IDs according to the visible Dreame map labels.
# Room 9 / Room 10 is intentionally omitted because it is a false room.
ROOMS = {
    1: "Küche",
    2: "Flur",
    3: "Alisa",
    4: "Julia",
    5: "Badezimmer",
    6: "Wohnzimmer Teppich",
    7: "Schlafzimmer",
    8: "Wohnzimmer",
}

PLATFORMS = ["switch", "select", "sensor", "button"]
