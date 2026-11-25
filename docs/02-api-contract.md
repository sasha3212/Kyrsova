# Контракт інтерфейсів системи ARGUS

Базовий URL за замовчуванням: `http://localhost:8090`. Перевизначається змінними оточення `VITE_ARGUS_API` та `VITE_ARGUS_WS`.

## REST

### `GET /api/v1/tracks`

Повертає початковий знімок обстановки.

```json
{
  "items": [
    {
      "id": "AIR-201",
      "label": "SKY-201",
      "kind": "aircraft",
      "affiliation": "friendly",
      "source": "adsb",
      "lat": 46.44,
      "lon": 30.62,
      "altitude": 3200,
      "speed": 420,
      "course": 95,
      "confidence": 0.98,
      "ts": 1763300000000
    }
  ]
}
```

Допускається також масив об'єктів без обгортки `items`.

### `GET /api/v1/zones`

Повертає список зон контролю.

```json
{
  "items": [
    {
      "id": "Z-ALFA",
      "name": "Заборонена зона «Альфа»",
      "type": "restricted",
      "polygon": [[30.74, 46.47], [30.82, 46.47], [30.82, 46.40], [30.74, 46.40]],
      "alertOnEntry": true,
      "active": true,
      "description": "Польоти заборонені без дозволу."
    }
  ]
}
```

Типи зони: `restricted`, `airspace`, `lane`, `security`.

### `POST /api/v1/zones`

Створює зону. Заголовок `Content-Type: application/json`.

```json
{
  "name": "Нова зона",
  "type": "restricted",
  "polygon": [[30.70, 46.40], [30.80, 46.40], [30.80, 46.30]],
  "alertOnEntry": true
}
```

Відповідь `201 Created` із створеною зоною (включаючи `id`). Помилки — `4xx/5xx` із полем `detail` або `message`.

## WebSocket

Адреса: `ws://localhost:8090/ws/situation`.

```json
{ "type": "track.update", "data": { "id": "AIR-201", "lat": 46.441, "lon": 30.622, "ts": 1763300005000 } }
```

Клієнт підтримує exponential backoff (1…30 с) і статуси `connecting`, `online`, `reconnecting`, `offline`, `error`.

## Автономний режим

Параметр `?mock=normal|air|surface|empty|error` повністю підміняє REST/WS. Мережеві запити не виконуються; створення зони відбувається локально з ідентифікатором `zon-local-*`.
