import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { ROOM_FILTERS, type RoomFilter } from '../format/room';
import { borderWidth, colors, radius, space, type } from '../theme/tokens';

type Props = {
  value: RoomFilter;
  counts: Record<RoomFilter, number>;
  onChange: (next: RoomFilter) => void;
};

export function RoomFilterBar({ value, counts, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.bar}
      contentContainerStyle={styles.row}
    >
      {ROOM_FILTERS.map(filter => {
        const active = filter === value;
        return (
          <Pressable
            key={filter}
            accessibilityRole="button"
            accessibilityLabel={`${filter}, ${counts[filter]} device`}
            accessibilityState={{ selected: active }}
            onPress={() => onChange(filter)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {filter} {counts[filter]}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bar: { flexGrow: 0, marginBottom: space.sm },
  row: { gap: space.xs },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { ...type.badge, color: colors.inkMuted },
  chipTextActive: { color: colors.canvas },
});
