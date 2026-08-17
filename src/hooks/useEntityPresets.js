import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { toast } from 'react-toastify';
import http from '../http';

const BASE_ENDPOINT = '/entity_presets';

/**
 * Cienki hook infrastrukturalny do obsługi presetów encji.
 *
 * Odpowiada za:
 * - pobranie presetów, opcji i bieżącego stanu użytkownika,
 * - zapis bieżącego user_ui_state,
 * - wybór aktywnego presetu,
 * - tworzenie presetów,
 * - aktualizowanie presetów,
 * - usuwanie presetów,
 * - aktualizację lokalnego cache po udanej operacji.
 *
 * Nie odpowiada za:
 * - stan formularzy,
 * - dirty state,
 * - tryby create/edit/clone,
 * - staging zmian,
 * - walidację konkretnego rodzaju presetu,
 * - reakcję na każdą zmianę w UI.
 */
export default function useEntityPresets({
  entityName = '',
  presetType = 'serverFilters',
  optionsFields = [],
  enabled = true,
  autoFetch = true,
  baseEndpoint = BASE_ENDPOINT,
} = {}) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [options, setOptions] = useState({});
  const [presets, setPresets] = useState([]);

  const [selectedPresetId, setSelectedPresetId] = useState(null);
  const [persistedState, setPersistedState] = useState({});

  /**
   * Stabilizujemy optionsFields, ponieważ tablica może być
   * tworzona inline przy każdym renderze komponentu.
   */
  const optionsFieldsKey = JSON.stringify(optionsFields ?? []);

  const normalizedOptionsFields = useMemo(() => {
    return Array.isArray(optionsFields)
      ? optionsFields
      : [];
  }, [optionsFieldsKey]);

  /**
   * Wspólny kontekst wszystkich operacji.
   */
  const requestContext = () => {
    return {
      entityName,
      presetType,
    };
  }

  /**
   * Pełny obiekt aktualnie wybranego presetu.
   */
  const activePreset = useMemo(() => {
    if (
      selectedPresetId === null ||
      selectedPresetId === undefined
    ) {
      return null;
    }

    return (
      presets.find(
        preset =>
          String(preset.id) === String(selectedPresetId)
      ) ?? null
    );
  }, [presets, selectedPresetId]);

  /**
   * Walidacja minimalnego kontekstu wymaganego przez API.
   */
  const validateContext = useCallback(() => {
    if (!enabled) {
      throw new Error('Obsługa presetów jest wyłączona.');
    }

    if (!entityName) {
      throw new Error('Brak wymaganej wartości entityName.');
    }

    if (!presetType) {
      throw new Error('Brak wymaganej wartości presetType.');
    }
  }, [
    enabled,
    entityName,
    presetType,
  ]);

  /**
   * Wspólna obsługa błędów requestów.
   */
  const handleError = useCallback((requestError, fallbackMessage) => {
    const message = String(
      requestError?.response?.data?.message ??
      requestError?.response?.data?.error ??
      requestError?.message ??
      fallbackMessage
    );

    setError(message);

    return requestError;
  }, []);

  /**
   * Pobiera pełny kontekst presetów.
   *
   * Obsługiwany format odpowiedzi:
   *
   * {
   *   options: {},
   *   presets: [],
   *   state: {
   *     selected_preset_id: 1,
   *     state: {}
   *   }
   * }
   *
   * Dla zgodności można również zwrócić listę presetów jako:
   *
   * {
   *   filters: []
   * }
   */
  const fetchPresets = useCallback(async () => {
    validateContext();

    setLoading(true);
    setError(null);

    try {
      const response = await http.get(
        `${baseEndpoint}/get.php`,
        {
          params: {
            entityName,
            presetType,
            optionsFields: normalizedOptionsFields,
          },
        }
      );

      const data = response?.data ?? {};

      /*
       * Tymczasowa zgodność z backendem, który może zwracać:
       *
       * presets: []
       *
       * albo:
       *
       * filters: []
       */
      const fetchedPresets = Array.isArray(data.presets)
        ? data.presets
        : Array.isArray(data.filters)
          ? data.filters
          : [];

      /*
       * Stan użytkownika może przyjść jako:
       *
       * state: {
       *   selected_preset_id: 1,
       *   state: {}
       * }
       *
       * Jeżeli rekordu user_ui_state jeszcze nie ma,
       * state może być pustym obiektem.
       */
      const userUiState = data.state ?? {};

      setOptions(data.options ?? {});
      setPresets(fetchedPresets);

      setSelectedPresetId(
        userUiState.selected_preset_id ??
        userUiState.selectedPresetId ??
        null
      );

      setPersistedState(
        userUiState.state ?? {}
      );

      return data;
    } catch (requestError) {
      throw handleError(
        requestError,
        'Nie udało się pobrać presetów.'
      );
    } finally {
      setLoading(false);
    }
  }, [
    baseEndpoint,
    entityName,
    presetType,
    normalizedOptionsFields,
    validateContext,
    handleError,
  ]);

  /**
   * Zapisuje bieżący stan roboczy użytkownika.
   *
   * Operacja zapisuje rekord user_ui_state.
   * Nie aktualizuje rekordu ui_presets.
   */
  const storeState = useCallback(
    async ({
      state,
      selectedPresetId: nextSelectedPresetId = selectedPresetId,
    }) => {
      validateContext();

      setSubmitting(true);
      setError(null);

      try {
        const payload = {
          ...requestContext(),
          selectedPresetId:
            nextSelectedPresetId ?? null,
          state: state ?? {},
        };

        const response = await http.post(
          `${baseEndpoint}/store_state.php`,
          payload
        );

        const data = response?.data ?? {};

        setSelectedPresetId(
          data.selected_preset_id ??
          data.selectedPresetId ??
          nextSelectedPresetId ??
          null
        );

        setPersistedState(
          data.state ?? state ?? {}
        );

        return data;
      } catch (requestError) {
        throw handleError(
          requestError,
          'Nie udało się zapisać bieżącego stanu.'
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      baseEndpoint,
      requestContext,
      selectedPresetId,
      validateContext,
      handleError,
    ]
  );

  /**
   * Zapisuje bieżący stan roboczy użytkownika.
   *
   * Operacja zapisuje rekord user_ui_state.
   * Nie aktualizuje rekordu ui_presets.
   */
  const clearState = useCallback(
    async () => {
      validateContext();

      setSubmitting(true);
      setError(null);

      try {
        const payload = {
          ...requestContext(),
        };

        const response = await http.post(
          `${baseEndpoint}/clear_state.php`,
          payload
        );

        const data =
          response ?? {};

        setSelectedPresetId(null);

        setPersistedState(
          data.state ?? []
        );

        return data;
      } catch (requestError) {
        throw handleError(
          requestError,
          "Nie udało się wyczyścić bieżącego stanu."
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      baseEndpoint,
      requestContext,
      validateContext,
      handleError,
    ]
  );

  /**
   * Ustawia wskazany preset jako aktywny.
   *
   * Backend powinien:
   * - sprawdzić dostęp użytkownika do presetu,
   * - pobrać state presetu,
   * - zapisać selected_preset_id w user_ui_state,
   * - skopiować state presetu do user_ui_state.state,
   * - zaktualizować last_active_at.
   */
  const selectPreset = useCallback(
    async presetId => {
      validateContext();

      setSubmitting(true);
      setError(null);

      try {
        const response = await http.post(
          `${baseEndpoint}/select.php`,
          {
            ...requestContext(),
            presetId,
          }
        );

        const data = response?.data ?? {};

        const selectedPreset =
          data.preset ??
          presets.find(
            preset =>
              String(preset.id) === String(presetId)
          ) ??
          null;

        setSelectedPresetId(
          data.selected_preset_id ??
          data.selectedPresetId ??
          presetId
        );

        setPersistedState(
          data.state ??
          selectedPreset?.state ??
          {}
        );

        /*
         * Jeżeli backend zwrócił zaktualizowany preset,
         * np. z nowym last_active_at, aktualizujemy cache.
         */
        if (data.preset?.id !== undefined) {
          setPresets(currentPresets =>
            currentPresets.map(preset =>
              String(preset.id) ===
                String(data.preset.id)
                ? data.preset
                : preset
            )
          );
        }

        return data;
      } catch (requestError) {
        throw handleError(
          requestError,
          'Nie udało się ustawić aktywnego presetu.'
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      baseEndpoint,
      requestContext,
      presets,
      validateContext,
      handleError,
    ]
  );

  /**
   * Tworzy nowy preset.
   *
   * Komponent domenowy przekazuje już gotowy payload:
   * nazwę, opis, widoczność i końcowy state.
   */
  const createPreset = useCallback(
    async ({
      name,
      description = '',
      isPublic = false,
      state = {},
    }) => {
      validateContext();

      setSubmitting(true);
      setError(null);

      try {
        const response = await http.post(
          `${baseEndpoint}/create.php`,
          {
            ...requestContext(),
            name,
            description,
            isPublic,
            state,
          }
        );

        const data = response ?? {};
        const createdPreset =
          data.preset ?? data;

        if (createdPreset?.id !== undefined) {
          setPresets(currentPresets => [
            ...currentPresets,
            createdPreset,
          ]);

          setSelectedPresetId(
            data.selected_preset_id ??
            data.selectedPresetId ??
            createdPreset.id
          );

          setPersistedState(
            data.state ??
            createdPreset.state ??
            state
          );
        }

        toast.success('Preset został utworzony.');

        return createdPreset;
      } catch (requestError) {
        throw handleError(
          requestError,
          'Nie udało się utworzyć presetu.'
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      baseEndpoint,
      requestContext,
      validateContext,
      handleError,
    ]
  );

  /**
   * Aktualizuje istniejący preset.
   *
   * Backend odpowiada za sprawdzenie, czy zalogowany
   * użytkownik jest właścicielem presetu.
   */
  const updatePreset = useCallback(async (preset) => {
    validateContext();

    setSubmitting(true);
    setError(null);

    try {
      const response = await http.post(
        `${baseEndpoint}/update.php`,
        {
          ...requestContext(),
          id: preset.id,
          name: preset.name,
          description: preset.description ?? "",
          isPublic: Boolean(preset.is_public),
          state: preset.state ?? {},
        }
      );

      const data = response ?? {};
      const updatedPreset = data.preset ?? null;

      if (!updatedPreset?.id) {
        throw new Error("Backend nie zwrócił zaktualizowanego presetu.");
      }

      setPresets((currentPresets) => {
        const exists = currentPresets.some((currentPreset) => {
          return String(currentPreset.id) === String(updatedPreset.id);
        });

        if (!exists) {
          return [...currentPresets, updatedPreset];
        }

        return currentPresets.map((currentPreset) => {
          if (String(currentPreset.id) !== String(updatedPreset.id)) {
            return currentPreset;
          }

          return updatedPreset;
        });
      });

      if (
        data.selected_preset_id !== undefined ||
        data.selectedPresetId !== undefined
      ) {
        setSelectedPresetId(
          data.selected_preset_id ??
          data.selectedPresetId ??
          null
        );
      }

      if (data.state !== undefined) {
        setPersistedState(data.state ?? {});
      } else if (
        String(selectedPresetId) === String(updatedPreset.id)
      ) {
        setPersistedState(updatedPreset.state ?? {});
      }

      toast.success("Preset został zapisany.");

      return updatedPreset;
    } catch (requestError) {
      throw handleError(
        requestError,
        "Nie udało się zapisać presetu."
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    baseEndpoint,
    requestContext,
    selectedPresetId,
    validateContext,
    handleError,
  ]);

  /**
   * Usuwa preset.
   *
   * Backend powinien sprawdzić własność presetu.
   * Jeżeli usunięty preset był aktywny, klucz obcy
   * ustawi selected_preset_id na null.
   */
  const deletePreset = useCallback(
    async id => {
      validateContext();

      setSubmitting(true);
      setError(null);

      try {
        const response = await http.post(
          `${baseEndpoint}/delete.php`,
          {
            ...requestContext,
            id,
          }
        );

        const data = response?.data ?? {};

        setPresets(currentPresets =>
          currentPresets.filter(
            preset =>
              String(preset.id) !== String(id)
          )
        );

        if (
          String(selectedPresetId) === String(id)
        ) {
          setSelectedPresetId(
            data.selected_preset_id ??
            data.selectedPresetId ??
            null
          );

          /*
           * Usunięcie presetu nie musi usuwać bieżącego
           * stanu roboczego użytkownika.
           *
           * Backend może zwrócić aktualny state.
           * Jeżeli go nie zwróci, pozostawiamy dotychczasowy.
           */
          if (data.state !== undefined) {
            setPersistedState(data.state ?? {});
          }
        }

        toast.success('Preset został usunięty.');

        return data;
      } catch (requestError) {
        throw handleError(
          requestError,
          'Nie udało się usunąć presetu.'
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      baseEndpoint,
      requestContext,
      selectedPresetId,
      validateContext,
      handleError,
    ]
  );

  /**
   * Automatyczne pobranie danych po:
   * - zamontowaniu hooka,
   * - zmianie entityName,
   * - zmianie presetType,
   * - zmianie optionsFields.
   */
  useEffect(() => {
    if (
      !autoFetch ||
      !enabled ||
      !entityName ||
      !presetType
    ) {
      return;
    }

    fetchPresets();
  }, [
    autoFetch,
    enabled,
    entityName,
    presetType,
    fetchPresets,
  ]);

  return {
    loading,
    submitting,
    error,

    options,
    presets,

    activePreset,
    selectedPresetId,
    persistedState,

    fetchPresets,
    storeState,
    clearState,
    selectPreset,
    createPreset,
    updatePreset,
    deletePreset,
  };
}