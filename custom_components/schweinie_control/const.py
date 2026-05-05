DOMAIN = "schweinie_control"

DEFAULT_VACUUM_ENTITY = "vacuum.schweinie"
DEFAULT_CUSTOMIZED_CLEANING_SWITCH = "switch.schweinie_customized_cleaning"

CONF_VACUUM_ENTITY = "vacuum_entity"
CONF_CUSTOMIZED_CLEANING_SWITCH = "customized_cleaning_switch"

ROOMS = {
    1: "Badezimmer",
    2: "Schlafzimmer",
    3: "Julia",
    4: "Flur",
    5: "Wohnzimmer",
    6: "Alisa",
    8: "Küche",
    9: "Wohnzimmer Teppich",
}

PLATFORMS = ["switch", "select", "sensor", "button"]
