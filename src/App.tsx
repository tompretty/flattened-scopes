import React, { useState } from "react";
import "./App.css";

interface NetworkScope {
  slice: string;
  dataNetwork: string;
}

interface SliceConfig {
  slice: string;
  dataNetworkConfigs: DataNetworkConfig[];
}

interface DataNetworkConfig {
  dataNetwork: string;
}

function App() {
  const [sliceConfigs, setSliceConfigs] = useState<SliceConfig[]>([]);

  const scopes = sliceConfigs
    .map((sliceConfig) =>
      sliceConfig.dataNetworkConfigs.map((dataNetworkConfig) => ({
        slice: sliceConfig.slice,
        dataNetwork: dataNetworkConfig.dataNetwork,
      }))
    )
    .flat();

  function addNewScope(scope: NetworkScope) {
    if (isScopeAlreadyCreated(scope)) {
      return;
    }

    const index = findSliceIndex(scope);

    if (index === -1) {
      addScopeToNewSliceConfig(scope);
    } else {
      addScopeToExistingSliceConfig(scope, index);
    }
  }

  function addScopeToNewSliceConfig(scope: NetworkScope) {
    const config: SliceConfig = {
      slice: scope.slice,
      dataNetworkConfigs: [{ dataNetwork: scope.dataNetwork }],
    };

    setSliceConfigs([...sliceConfigs, config]);
  }

  function addScopeToExistingSliceConfig(
    scope: NetworkScope,
    sliceIndex: number
  ) {
    const sliceConfig = sliceConfigs[sliceIndex];

    const updatedSliceConfig: SliceConfig = {
      ...sliceConfig,
      dataNetworkConfigs: [
        ...sliceConfig.dataNetworkConfigs,
        { dataNetwork: scope.dataNetwork },
      ],
    };

    setSliceConfigs([
      ...sliceConfigs.slice(0, sliceIndex),
      updatedSliceConfig,
      ...sliceConfigs.slice(sliceIndex + 1),
    ]);
  }

  function updateExistingScope(originalScope: NetworkScope) {
    function onSave(scope: NetworkScope) {
      if (originalScope.slice === scope.slice) {
        const sliceIndex = findSliceIndex(originalScope);

        const sliceConfig = sliceConfigs[sliceIndex];

        const dataNetworkIndex = findDataNetworkIndex(
          originalScope,
          sliceConfig
        );

        const newDataNetworkConfig: DataNetworkConfig = {
          dataNetwork: scope.dataNetwork,
        };

        const updatedSliceConfig: SliceConfig = {
          ...sliceConfig,
          dataNetworkConfigs: withUpdatedItemAtIndex(
            sliceConfig.dataNetworkConfigs,
            newDataNetworkConfig,
            dataNetworkIndex
          ),
        };

        setSliceConfigs(
          withUpdatedItemAtIndex(sliceConfigs, updatedSliceConfig, sliceIndex)
        );
      } else {
        const originalSliceIndex = findSliceIndex(originalScope);

        const originalSliceConfig = sliceConfigs[originalSliceIndex];

        const originalDataNetworkIndex = findDataNetworkIndex(
          originalScope,
          originalSliceConfig
        );

        const updatedOriginalSliceConfig: SliceConfig = {
          ...originalSliceConfig,
          dataNetworkConfigs: withoutItemAtIndex(
            originalSliceConfig.dataNetworkConfigs,
            originalDataNetworkIndex
          ),
        };

        const sliceConfigsWithOriginalUpdated =
          updatedOriginalSliceConfig.dataNetworkConfigs.length > 0
            ? withUpdatedItemAtIndex(
                sliceConfigs,
                updatedOriginalSliceConfig,
                originalSliceIndex
              )
            : withoutItemAtIndex(sliceConfigs, originalSliceIndex);

        const newSliceIndex = findSliceIndex(
          scope,
          sliceConfigsWithOriginalUpdated
        );

        if (newSliceIndex === -1) {
          const newSliceConfig: SliceConfig = {
            slice: scope.slice,
            dataNetworkConfigs: [{ dataNetwork: scope.dataNetwork }],
          };

          setSliceConfigs([...sliceConfigsWithOriginalUpdated, newSliceConfig]);
        } else {
          const newSliceConfig = sliceConfigsWithOriginalUpdated[newSliceIndex];

          const newDataNetworkConfig: DataNetworkConfig = {
            dataNetwork: scope.dataNetwork,
          };

          const updatedNewSliceConfig: SliceConfig = {
            ...newSliceConfig,
            dataNetworkConfigs: [
              ...newSliceConfig.dataNetworkConfigs,
              newDataNetworkConfig,
            ],
          };

          setSliceConfigs(
            withUpdatedItemAtIndex(
              sliceConfigsWithOriginalUpdated,
              updatedNewSliceConfig,
              newSliceIndex
            )
          );
        }
      }
      // slice same, dn same -> update original
      // slice same, dn different -> update original
      // slice different, dn same -> remove from original, update new slice
      // slice different, dn different -> remove from original, update new slice
    }

    return onSave;
  }

  function withUpdatedItemAtIndex<T>(list: T[], item: T, index: number) {
    return [...list.slice(0, index), item, ...list.slice(index + 1)];
  }

  function withoutItemAtIndex<T>(list: T[], index: number) {
    return [...list.slice(0, index), ...list.slice(index + 1)];
  }

  function findSliceIndex(
    scope: NetworkScope,
    configs: SliceConfig[] = sliceConfigs
  ) {
    return configs.findIndex((config) => config.slice === scope.slice);
  }

  function findDataNetworkIndex(scope: NetworkScope, sliceConfig: SliceConfig) {
    return sliceConfig.dataNetworkConfigs.findIndex(
      (config) => config.dataNetwork === scope.dataNetwork
    );
  }

  function isScopeAlreadyCreated(scope: NetworkScope) {
    const sliceConfig = sliceConfigs.find(
      (config) => config.slice === scope.slice
    );

    if (!sliceConfig) {
      return false;
    }

    const dataNetworkConfig = sliceConfig.dataNetworkConfigs.find(
      (config) => config.dataNetwork === scope.dataNetwork
    );

    if (!dataNetworkConfig) {
      return false;
    }

    return true;
  }

  return (
    <div className="App">
      <h1>Network scope example</h1>
      <div>
        <h2>Add scope</h2>

        <NetworkScopeEditor onSave={addNewScope} />
      </div>

      <div>
        <h2>Update scopes</h2>

        {scopes.map((scope) => (
          <NetworkScopeEditor
            key={`${scope.slice} + ${scope.dataNetwork}`}
            slice={scope.slice}
            dataNetwork={scope.dataNetwork}
            onSave={updateExistingScope(scope)}
          />
        ))}
      </div>
    </div>
  );
}

const SLICES = ["slice-1", "slice-2"];

const DATA_NETWORKS = ["dn-1", "dn-2"];

interface NetworkScopeEditorProps {
  slice?: string;
  dataNetwork?: string;
  onSave: (scope: NetworkScope) => void;
}

function NetworkScopeEditor({
  slice: initialSlice,
  dataNetwork: initialDataNetwork,
  onSave,
}: NetworkScopeEditorProps) {
  const [slice, setSlice] = useState(initialSlice);
  const [dataNetwork, setDataNetwork] = useState(initialDataNetwork);

  function handleSave() {
    if (slice && dataNetwork) {
      onSave({ slice, dataNetwork });
    }
  }

  return (
    <div>
      <Dropdown options={SLICES} selected={slice} onChange={setSlice} />
      <Dropdown
        options={DATA_NETWORKS}
        selected={dataNetwork}
        onChange={setDataNetwork}
      />
      <button onClick={handleSave}>Save</button>
    </div>
  );
}

interface DropdownProps {
  options: string[];
  selected?: string;
  onChange: (option: string) => void;
}

function Dropdown({ options, selected, onChange }: DropdownProps) {
  return (
    <select onChange={(e) => onChange(e.target.value)} value={selected}>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

export default App;
