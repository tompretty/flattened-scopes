import React, { useState } from "react";
import "./App.css";
import {
  addNewScope,
  flattenToScopes,
  updateExistingScope,
} from "./sliceConfigHelpers";

export interface NetworkScope {
  slice: string;
  dataNetwork: string;
}

export interface SliceConfig {
  slice: string;
  dataNetworkConfigs: DataNetworkConfig[];
}

export interface DataNetworkConfig {
  dataNetwork: string;
}

function App() {
  const [sliceConfigs, setSliceConfigs] = useState<SliceConfig[]>([]);

  function onAddScope(scope: NetworkScope) {
    setSliceConfigs(addNewScope(sliceConfigs, scope));
  }

  function onUpdateScope(originalScope: NetworkScope) {
    function onUpdate(scope: NetworkScope) {
      setSliceConfigs(updateExistingScope(sliceConfigs, originalScope, scope));
    }
    return onUpdate;
  }

  return (
    <div className="App">
      <h1>Network scope example</h1>
      <div>
        <h2>Add scope</h2>

        <NetworkScopeEditor onSave={onAddScope} />
      </div>

      <div>
        <h2>Update scopes</h2>

        {flattenToScopes(sliceConfigs).map((scope) => (
          <NetworkScopeEditor
            key={`${scope.slice} + ${scope.dataNetwork}`}
            slice={scope.slice}
            dataNetwork={scope.dataNetwork}
            onSave={onUpdateScope(scope)}
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
