# Діаграма класів (доменна модель)

```mermaid
classDiagram
    class Track {
        +id: string
        +kind: Kind
        +affiliation: Affiliation
        +source: Source
        +lat: number
        +lon: number
        +altitude: number|null
        +speed: number
        +course: number
        +confidence: number
        +ts: number
        +label: string
    }

    class Kind {
        <<enumeration>>
        aircraft
        helicopter
        uav
        missile
        ship
        boat
        submarine
    }

    class Affiliation {
        <<enumeration>>
        friendly
        neutral
        suspect
        unknown
        hostile
    }

    class Zone {
        +id: string
        +name: string
        +type: ZoneType
        +polygon: Point[]
        +alertOnEntry: boolean
        +active: boolean
        +description: string
    }

    class ZoneEvent {
        +id: string
        +targetId: string
        +zoneId: string
        +severity: string
        +ts: number
    }

    class ObservationPost {
        +id: string
        +lat: number
        +lon: number
    }

    Track --> Kind
    Track --> Affiliation
    Zone "1" o-- "*" Point
    ZoneEvent --> Track
    ZoneEvent --> Zone
    ObservationPost ..> Track : пеленг / дальність
```

## Доменні інваріанти

- `course ∈ [0, 360)`, `confidence ∈ [0, 1]`, `speed ≥ 0`.
- `altitude` задано лише для повітряних цілей (`domain = air`).
- Полігон зони містить щонайменше 3 точки.
- Подія входу створюється один раз для пари `(targetId, zoneId)`.
