import { DataNetworkConfig, NetworkScope, SliceConfig } from "./App";

export function addNewScope(
  sliceConfigs: SliceConfig[],
  scope: NetworkScope
): SliceConfig[] {
  if (isScopeAlreadyCreated(sliceConfigs, scope)) {
    return sliceConfigs;
  }

  return addScopeToSliceConfig(sliceConfigs, scope);
}

export function updateExistingScope(
  sliceConfigs: SliceConfig[],
  originalScope: NetworkScope,
  newScope: NetworkScope
): SliceConfig[] {
  if (originalScope.slice === newScope.slice) {
    return updateScopeInSliceConfig(sliceConfigs, originalScope, newScope);
  }

  return updateScopeBetweenSliceConfigs(sliceConfigs, originalScope, newScope);
}

export function flattenToScopes(sliceConfigs: SliceConfig[]): NetworkScope[] {
  return sliceConfigs
    .map((sliceConfig) =>
      sliceConfig.dataNetworkConfigs.map((dataNetworkConfig) => ({
        slice: sliceConfig.slice,
        dataNetwork: dataNetworkConfig.dataNetwork,
      }))
    )
    .flat();
}

// ---- Helpers ---- //

function addScopeToSliceConfig(
  sliceConfigs: SliceConfig[],
  scope: NetworkScope
): SliceConfig[] {
  const sliceIndex = findSliceIndex(sliceConfigs, scope);

  if (sliceIndex === -1) {
    return addScopeToNewSliceConfig(sliceConfigs, scope);
  }

  return addScopeToExistingSliceConfig(sliceConfigs, sliceIndex, scope);
}

function addScopeToNewSliceConfig(
  sliceConfigs: SliceConfig[],
  scope: NetworkScope
): SliceConfig[] {
  return [...sliceConfigs, newSliceConfig(scope)];
}

function addScopeToExistingSliceConfig(
  sliceConfigs: SliceConfig[],
  sliceIndex: number,
  scope: NetworkScope
) {
  const updatedSliceConfig = addDataNetworkToSliceConfig(
    sliceConfigs[sliceIndex],
    scope
  );

  return withUpdatedItemAtIndex(sliceConfigs, updatedSliceConfig, sliceIndex);
}

function updateScopeInSliceConfig(
  sliceConfigs: SliceConfig[],
  originalScope: NetworkScope,
  newScope: NetworkScope
): SliceConfig[] {
  const sliceIndex = findSliceIndex(sliceConfigs, originalScope);

  const sliceConfig = sliceConfigs[sliceIndex];

  const dataNetworkIndex = findDataNetworkIndex(sliceConfig, originalScope);

  const updatedSliceConfig = updateDataNetworkInSliceConfig(
    sliceConfig,
    dataNetworkIndex,
    newScope
  );

  return withUpdatedItemAtIndex(sliceConfigs, updatedSliceConfig, sliceIndex);
}

function updateScopeBetweenSliceConfigs(
  sliceConfigs: SliceConfig[],
  originalScope: NetworkScope,
  newScope: NetworkScope
): SliceConfig[] {
  return addScopeToSliceConfig(
    removeScopeFromSliceConfig(sliceConfigs, originalScope),
    newScope
  );
}

function removeScopeFromSliceConfig(
  sliceConfigs: SliceConfig[],
  scope: NetworkScope
) {
  const sliceIndex = findSliceIndex(sliceConfigs, scope);

  const sliceConfig = sliceConfigs[sliceIndex];

  const dataNetworkIndex = findDataNetworkIndex(sliceConfig, scope);

  const updatedSliceConfig = removeDataNetworkFromSliceConfig(
    sliceConfig,
    dataNetworkIndex
  );

  return updatedSliceConfig.dataNetworkConfigs.length > 0
    ? withUpdatedItemAtIndex(sliceConfigs, updatedSliceConfig, sliceIndex)
    : withoutItemAtIndex(sliceConfigs, sliceIndex);
}

// ------ Validation ------ //

function isScopeAlreadyCreated(
  sliceConfigs: SliceConfig[],
  scope: NetworkScope
) {
  const sliceIndex = findSliceIndex(sliceConfigs, scope);

  if (sliceIndex === -1) {
    return false;
  }

  const dataNetworkIndex = findDataNetworkIndex(
    sliceConfigs[sliceIndex],
    scope
  );

  if (dataNetworkIndex === -1) {
    return false;
  }

  return true;
}

// ------ Slice configs ------ //

function newSliceConfig(scope: NetworkScope): SliceConfig {
  return {
    slice: scope.slice,
    dataNetworkConfigs: [{ dataNetwork: scope.dataNetwork }],
  };
}

function addDataNetworkToSliceConfig(
  sliceConfig: SliceConfig,
  scope: NetworkScope
): SliceConfig {
  return {
    ...sliceConfig,
    dataNetworkConfigs: [
      ...sliceConfig.dataNetworkConfigs,
      { dataNetwork: scope.dataNetwork },
    ],
  };
}

function updateDataNetworkInSliceConfig(
  sliceConfig: SliceConfig,
  dataNetworkIndex: number,
  scope: NetworkScope
): SliceConfig {
  const newDataNetworkConfig: DataNetworkConfig = {
    dataNetwork: scope.dataNetwork,
  };

  return {
    ...sliceConfig,
    dataNetworkConfigs: withUpdatedItemAtIndex(
      sliceConfig.dataNetworkConfigs,
      newDataNetworkConfig,
      dataNetworkIndex
    ),
  };
}

function removeDataNetworkFromSliceConfig(
  sliceConfig: SliceConfig,
  dataNetworkIndex: number
): SliceConfig {
  return {
    ...sliceConfig,
    dataNetworkConfigs: withoutItemAtIndex(
      sliceConfig.dataNetworkConfigs,
      dataNetworkIndex
    ),
  };
}

// ------ Arrays ------ //

function findSliceIndex(sliceConfigs: SliceConfig[], scope: NetworkScope) {
  return sliceConfigs.findIndex((config) => config.slice === scope.slice);
}

function findDataNetworkIndex(sliceConfig: SliceConfig, scope: NetworkScope) {
  return sliceConfig.dataNetworkConfigs.findIndex(
    (config) => config.dataNetwork === scope.dataNetwork
  );
}

function withUpdatedItemAtIndex<T>(list: T[], item: T, index: number) {
  return [...list.slice(0, index), item, ...list.slice(index + 1)];
}

function withoutItemAtIndex<T>(list: T[], index: number) {
  return [...list.slice(0, index), ...list.slice(index + 1)];
}
