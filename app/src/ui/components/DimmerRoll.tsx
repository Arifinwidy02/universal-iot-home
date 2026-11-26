import { useRef, useState, type ComponentRef } from 'react';
import {
  PanResponder,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { borderWidth, colors, radius, space, type } from '../theme/tokens';

type Props = {
  value: number;
  disabled?: boolean;
  onCommit: (brightness: number) => void;
};

const MARKS = [0, 25, 50, 75, 100] as const;

export function DimmerRail({ value, disabled, onCommit }: Props) {
  const trackRef = useRef<ComponentRef<typeof View> | null>(null);
  const geom = useRef({ x: 0, w: 0 });
  const [drag, setDrag] = useState<number | null>(null);
  const shown = drag ?? value;
  const pending = useRef<number | null>(null);

  const syncGeometry = () => {
    const node = trackRef.current;
    if (!node) return;
    node.measureInWindow((x, _y, w) => {
      if (w > 0) {
        geom.current = { x, w };
      } else {
        setTimeout(syncGeometry, 50);
      }
    });
  };

  const percentFromPage = (pageX: number): number | null => {
    const { x, w } = geom.current;
    if (w <= 0) return null;
    if (pageX <= 0) return null;
    return Math.max(0, Math.min(100, Math.round(((pageX - x) / w) * 100)));
  };

  const responder = PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onMoveShouldSetPanResponder: () => !disabled,
    onPanResponderGrant: e => {
      if (geom.current.w <= 0) syncGeometry();
      const pct = percentFromPage(e.nativeEvent.pageX);
      if (pct === null) return;
      pending.current = pct;
      setDrag(pct);
    },
    onPanResponderMove: (e, gesture) => {
      const pct = percentFromPage(gesture.moveX || e.nativeEvent.pageX);
      if (pct === null) return;
      pending.current = pct;
      setDrag(pct);
    },
    onPanResponderRelease: () => {
      const pct = pending.current;
      pending.current = null;
      setDrag(null);
      if (pct !== null && pct !== value) onCommit(pct);
    },
    onPanResponderTerminate: () => {
      pending.current = null;
      setDrag(null);
    },
  });

  return (
    <View>
      <View
        ref={node => {
          trackRef.current = node;
          if (node) syncGeometry();
        }}
        {...(disabled ? {} : responder.panHandlers)}
        onLayout={(e: LayoutChangeEvent) => {
          geom.current.w = e.nativeEvent.layout.width;
          syncGeometry();
        }}
        accessibilityRole="adjustable"
        accessibilityLabel="Brightness"
        accessibilityValue={{ min: 0, max: 100, now: shown }}
        style={[styles.track, disabled && styles.disabled]}
      >
        <View style={[styles.fill, { width: `${shown}%` }]} />
        <View style={[styles.handle, { left: `${shown}%` }]} />
      </View>
      <View style={styles.scale}>
        {MARKS.map(mark => (
          <View
            key={mark}
            style={[
              styles.markWrap,
              mark === 0
                ? styles.markStart
                : mark === 100
                ? styles.markEnd
                : { left: `${mark}%` },
            ]}
            pointerEvents="none"
          >
            <Text style={styles.scaleText}>{mark === 100 ? '100%' : mark}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 36,
    borderRadius: radius.control,
    borderWidth: borderWidth.card,
    borderColor: colors.borderStrong,
    backgroundColor: colors.recessed,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  disabled: { opacity: 0.45 },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.accentSoft,
  },
  handle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2.5,
    marginLeft: -1.25,
    backgroundColor: colors.accent,
  },
  scale: {
    height: 16,
    marginTop: space.xxs,
  },
  markWrap: {
    position: 'absolute',
    transform: [{ translateX: -12 }],
    width: 24,
    alignItems: 'center',
  },
  markStart: {
    left: 0,
    transform: [{ translateX: 0 }],
    alignItems: 'flex-start',
  },
  markEnd: {
    left: '100%',
    transform: [{ translateX: -24 }],
    alignItems: 'flex-end',
  },
  scaleText: { ...type.badge, color: colors.inkMuted },
});
