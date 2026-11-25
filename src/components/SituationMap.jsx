import { AREA, COASTLINE, LAND_POLYGON, OBSERVATION_POST, RANGE_RINGS_NM } from '../data/area.js';
import { NM_PER_DEG_LAT, pointInPolygon, project, projectCourseVector, toRadians } from '../lib/geo.js';
import { ZONE_TYPES } from '../lib/zones.js';

const { bbox, width, height } = AREA;
const viewport = { bbox, width, height };

function toPath(points) {
  return points.map(([lon, lat], i) => {
    const p = project({ lon, lat }, viewport);
    return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(' ') + (points.length > 2 ? ' Z' : '');
}

function ringRadii(nm) {
  const origin = project(OBSERVATION_POST, viewport);
  const spanLon = bbox.east - bbox.west;
  const spanLat = bbox.north - bbox.south;
  const lonScale = Math.cos(toRadians(OBSERVATION_POST.lat)) || 1;
  return {
    cx: origin.x,
    cy: origin.y,
    rx: (nm / (NM_PER_DEG_LAT * lonScale)) * (width / spanLon),
    ry: (nm / NM_PER_DEG_LAT) * (height / spanLat),
  };
}

export function SituationMap({ targets = [], zones = [], selectedId, onSelect }) {
  return (
    <div className="map-frame">
      <svg
        className="map-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Схема повітряної обстановки над акваторією та узбережжям"
      >
        <defs>
          <pattern id="sea-grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M50 0 L0 0 0 50" fill="none" stroke="rgba(120,190,220,.07)" strokeWidth="1" />
          </pattern>
          <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect x="0" y="0" width={width} height={height} className="map-sea" />
        <rect x="0" y="0" width={width} height={height} fill="url(#sea-grid)" />
        <path d={toPath(LAND_POLYGON)} className="map-land" />
        <path d={toPath(COASTLINE)} className="map-coast" />

        {RANGE_RINGS_NM.map((nm) => {
          const r = ringRadii(nm);
          return (
            <g key={nm}>
              <ellipse cx={r.cx} cy={r.cy} rx={r.rx} ry={r.ry} className="map-ring" />
              <text x={r.cx + r.rx - 4} y={r.cy - 4} className="map-ring-label">{nm} NM</text>
            </g>
          );
        })}

        {zones.map((zone) => {
          const meta = ZONE_TYPES[zone.type] || ZONE_TYPES.restricted;
          const centroid = zone.polygon.reduce(
            (acc, [lon, lat]) => ({ lon: acc.lon + lon, lat: acc.lat + lat }),
            { lon: 0, lat: 0 },
          );
          const labelPoint = project(
            { lon: centroid.lon / zone.polygon.length, lat: centroid.lat / zone.polygon.length },
            viewport,
          );
          return (
            <g key={zone.id} className={`map-zone map-zone--${meta.color} ${zone.active ? '' : 'is-off'}`}>
              <path d={toPath(zone.polygon)} />
              <text x={labelPoint.x} y={labelPoint.y}>{zone.name}</text>
            </g>
          );
        })}

        <g className="map-post" transform={`translate(${project(OBSERVATION_POST, viewport).x},${project(OBSERVATION_POST, viewport).y})`}>
          <circle r="11" className="map-post__outer" />
          <circle r="4" className="map-post__inner" />
          <text x="14" y="-8">OP-1</text>
        </g>

        {targets.map((target) => {
          const p = project(target, viewport);
          const vector = projectCourseVector(target, target.course, 16, viewport);
          const selected = target.id === selectedId;
          return (
            <g
              key={target.id}
              className={`map-target aff--${target.affiliationColor} ${selected ? 'is-selected' : ''} fresh--${target.freshness}`}
              onClick={() => onSelect?.(target.id)}
              role="button"
              tabIndex={0}
              aria-label={`${target.callsign}, ${target.kindLabel}, ${target.affiliationLabel}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect?.(target.id);
                }
              }}
            >
              {selected && <circle cx={p.x} cy={p.y} r="17" className="map-target__halo" filter="url(#glow)" />}
              <line x1={vector.x1} y1={vector.y1} x2={vector.x2} y2={vector.y2} className="map-target__vector" />
              <circle cx={p.x} cy={p.y} r="9" className="map-target__hit" />
              <text x={p.x} y={p.y + 4} className="map-target__glyph" textAnchor="middle">{target.glyph}</text>
              <text x={p.x + 12} y={p.y - 8} className="map-target__label">{target.callsign}</text>
              <text x={p.x + 12} y={p.y + 5} className="map-target__meta">{target.altitudeLabel} · {target.distanceLabel} NM</text>
            </g>
          );
        })}
      </svg>
      <div className="map-compass" aria-hidden="true">Пн ↑</div>
      <div className="map-scale" aria-hidden="true">bbox {bbox.west}–{bbox.east} E · {bbox.south}–{bbox.north} N</div>
    </div>
  );
}

export function targetInArea(target) {
  return pointInPolygon({ lon: target.lon, lat: target.lat }, LAND_POLYGON) === false;
}
