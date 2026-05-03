import { useEffect, useState } from "react";
import {
  getInteractionStates,
  type InteractionType,
  type MovieInteractionState,
} from "@/api/recommendations";

export const createEmptyInteractionState = (): MovieInteractionState => ({
  viewed: false,
  liked: false,
  disliked: false,
  favorite: false,
  skipped: false,
});

export const applyInteractionToState = (
  currentState: MovieInteractionState,
  type: InteractionType,
): MovieInteractionState => {
  switch (type) {
    case "viewed":
      return {
        ...currentState,
        viewed: true,
      };
    case "liked":
      return {
        ...currentState,
        liked: true,
        disliked: false,
        skipped: false,
      };
    case "disliked":
      return {
        ...currentState,
        liked: false,
        disliked: true,
        favorite: false,
        skipped: false,
      };
    case "favorite":
      return {
        ...currentState,
        disliked: false,
        favorite: true,
        skipped: false,
      };
    case "skipped":
      return {
        ...currentState,
        liked: false,
        disliked: false,
        favorite: false,
        skipped: true,
      };
    default:
      return currentState;
  }
};

export function useMovieInteractionStates(itemIds: number[]) {
  const [interactionStates, setInteractionStates] = useState<Record<number, MovieInteractionState>>(
    {},
  );

  const normalizedItemIds = Array.from(
    new Set(itemIds.filter((itemId) => Number.isInteger(itemId) && itemId > 0)),
  );
  const itemIDsKey = normalizedItemIds.join(",");

  useEffect(() => {
    let isMounted = true;

    if (normalizedItemIds.length === 0) {
      setInteractionStates({});
      return () => {
        isMounted = false;
      };
    }

    const loadInteractionStates = async () => {
      try {
        const response = await getInteractionStates(normalizedItemIds);
        if (!isMounted) {
          return;
        }

        const nextStates: Record<number, MovieInteractionState> = {};
        for (const itemId of normalizedItemIds) {
          nextStates[itemId] = createEmptyInteractionState();
        }

        for (const [itemId, state] of Object.entries(response.items)) {
          const numericItemId = Number(itemId);
          if (!Number.isInteger(numericItemId) || numericItemId <= 0) {
            continue;
          }

          nextStates[numericItemId] = state;
        }

        setInteractionStates(nextStates);
      } catch (error) {
        console.error("Failed to load interaction states", error);
      }
    };

    void loadInteractionStates();

    return () => {
      isMounted = false;
    };
  }, [itemIDsKey]);

  const setInteractionState = (itemId: number, nextState: MovieInteractionState) => {
    setInteractionStates((currentStates) => ({
      ...currentStates,
      [itemId]: nextState,
    }));
  };

  return {
    interactionStates,
    setInteractionState,
  };
}
