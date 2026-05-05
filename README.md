# Schweinie Control

Companion Home Assistant integration for controlling a Dreame vacuum named `vacuum.schweinie`.

This integration is intended to be installed through HACS as a custom repository.

## What it does

- Adds room-selection switches for the Dreame room IDs currently used by Schweinie.
- Adds a repeat selector.
- Adds buttons for cleaning selected rooms and resetting selection.
- Adds a sensor with selected room metadata.
- Adds services for segment cleaning and resetting selection.

It does **not** replace the Dreame Vacuum integration. It is only a small control layer above it.

## Current room mapping

| Room ID | Name |
|---:|---|
| 1 | Badezimmer |
| 2 | Schlafzimmer |
| 3 | Julia |
| 4 | Flur |
| 5 | Wohnzimmer |
| 6 | Alisa |
| 8 | Küche |
| 9 | Wohnzimmer Teppich |

## HACS installation

1. HACS → Integrations → three dots → Custom repositories.
2. Add repository: `https://github.com/nashsmartdom/schweinie-control`
3. Category: `Integration`.
4. Install **Schweinie Control**.
5. Restart Home Assistant.
6. Settings → Devices & services → Add integration → **Schweinie Control**.

Default configuration:

- Vacuum entity: `vacuum.schweinie`
- Customized cleaning switch: `switch.schweinie_customized_cleaning`

## Services

### `schweinie_control.clean_rooms`

Example:

```yaml
service: schweinie_control.clean_rooms
data:
  rooms:
    - 1
    - 4
    - 8
  repeats: 1
```

If `rooms` is omitted, the currently selected room switches are used.

### `schweinie_control.reset_selection`

Resets all selected room switches.

```yaml
service: schweinie_control.reset_selection
```

## Notes

Old Valetudo logic is intentionally not used.
