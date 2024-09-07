export const getAllOrganizations = () => {
    return new Promise((resolve, reject) => {
      const {unsubscribe} = window.api.organization.getAllOrganizations.withAll.subscribe(undefined, {
        onData: (data) => {
          unsubscribe();  
          resolve(data);  
        },
        onError: (error) => {
          console.error("An error occurred:", error);
          unsubscribe();  
          reject(error);  
        },
        context: { scope: { userId: 'us00000000' } }
      });
    });
  };