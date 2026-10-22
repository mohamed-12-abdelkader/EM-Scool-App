import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { ScrollView, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';

const NAV_OFFSET = 8;

type LandingScrollApi = {
  scrollTo: (sectionId: string) => void;
};

const LandingScrollContext = createContext<LandingScrollApi>({
  scrollTo: () => undefined,
});

const LandingRegisterContext = createContext<(ids: string[], y: number) => void>(() => undefined);

export function useLandingScroll() {
  return useContext(LandingScrollContext);
}

/** Sticky navbar + one ScrollView for the whole landing page. */
export function LandingScrollShell({
  navbar,
  children,
}: {
  navbar: ReactNode;
  children: ReactNode;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const offsets = useRef<Record<string, number>>({});

  const register = useCallback((ids: string[], y: number) => {
    for (const id of ids) {
      offsets.current[id] = y;
    }
  }, []);

  const scrollTo = useCallback((sectionId: string) => {
    if (!sectionId || sectionId === 'top') {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    const y = offsets.current[sectionId];
    if (typeof y === 'number') {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - NAV_OFFSET), animated: true });
    }
  }, []);

  const api = useMemo(() => ({ scrollTo }), [scrollTo]);

  return (
    <LandingScrollContext.Provider value={api}>
      <View style={{ flex: 1 }}>
        {navbar}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <LandingRegisterContext.Provider value={register}>{children}</LandingRegisterContext.Provider>
        </ScrollView>
      </View>
    </LandingScrollContext.Provider>
  );
}

/**
 * Direct child of LandingScrollShell content.
 * `layout.y` is the scroll offset used by the navbar.
 */
export function LandingSection({
  id,
  ids,
  children,
  style,
}: {
  id?: string;
  /** Extra aliases that scroll to the same place (e.g. product + stages). */
  ids?: string[];
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const register = useContext(LandingRegisterContext);
  const allIds = [...(id ? [id] : []), ...(ids ?? [])];

  const onLayout = (e: LayoutChangeEvent) => {
    if (allIds.length) {
      register(allIds, e.nativeEvent.layout.y);
    }
  };

  return (
    <View
      nativeID={allIds[0]}
      collapsable={false}
      onLayout={onLayout}
      style={style}
    >
      {children}
    </View>
  );
}
