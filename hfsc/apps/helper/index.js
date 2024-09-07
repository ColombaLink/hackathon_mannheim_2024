export const getAllOrganizations = () => {
  return new Promise((resolve, reject) => {
    const { unsubscribe } = window.api.organization.getAllOrganizations.withAll.subscribe(undefined, {
      onData: (data) => {
        unsubscribe();
        resolve(data);
      },
      onError: (error) => {
        console.error("An error occurred:", error);
        unsubscribe();
        reject(error);
      },
      ...getContext()
    });
  });
};

export const getContext = (userId, orgAliasId, projectAliasId) => {
  return {
    context: {
      scope: {
        userId: userId || 'us00000000',
        orgAliasId: orgAliasId || 'org/lidl-schweiz-rebgasse-20',
        projectAliasId: projectAliasId || 'org/lidl-schweiz-rebgasse-20/project/inventory'
      }
    }
  }
}