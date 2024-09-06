import { CBasedTestServerSpec, TestServer, SelvaTestClusterSpec, saveOnShutdown } from '@colombalink/cbased-core'
import { connect } from '@saulx/selva'
import * as fs from 'fs';
import * as path from 'path';


const run = async () => {
    let appSpec = new CBasedTestServerSpec()
    appSpec.name = `default`
    appSpec.defaultDbName = "default"
    appSpec.port = 8010
    appSpec.devMode = true
    await appSpec.loadFunctions('./functions/sc')
    await appSpec.setFunctionsAuthAutomatically()
    
    await appSpec.generateKeys("/workspaces/monidas/apps/monidas/.tmp/keys")
    let testServer = new TestServer(appSpec)
    const selvaSpec = new SelvaTestClusterSpec()
    selvaSpec.dir = ".tmp/data"

    const selvaC = connect({
        host: 'localhost',
        port: 9000
    })
    


    
    testServer.setSelvaClusterSpec(selvaSpec)

    await testServer.startBased(appSpec)
    const x = testServer.basedServers.get("default").server.clients.selva
    console.log(x)
    console.log(await x.get({
        $db: 'default',
        $all: true
    })) 
    // Watch for changes in the functions folder
    watchFolderRecursive('./functions/sc', appSpec, testServer)

}


run().catch(console.error)

// function watchFolderRecursive(folderPath: string, server: CBasedTestServerSpec, testServer: TestServer) {
function watchFolderRecursive(folderPath, server, testServer) {
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        files.forEach(file => {
            const filePath = path.join(folderPath, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error('Error getting file stats:', err);
                    return;
                }

                if (stats.isDirectory()) {
                    // Recursively watch subfolders
                    watchFolderRecursive(filePath, server, testServer);
                } else {
                    // Watch individual files
                    fs.watch(filePath, async (eventType, filename) => {
                        if (eventType === 'change') {
                            try {
                                console.log('File changed in folder:', folderPath);
                                const cBasedTestServer = testServer.getBasedServer(server.name)
                                if (folderPath.includes("functions/app/trpc/")) {
                                    folderPath = "functions/app/trpc/"
                                }
                                console.log('File changed in folder:', folderPath);
                                await cBasedTestServer.updateFun(folderPath)
                            }
                            catch (e) {
                                console.log(e)
                            }
                        }
                    });
                }
            });
        });
    });
}




// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err)
    // You can optionally perform any cleanup or logging here
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Promise Rejection:', reason)
    // You can optionally perform any cleanup or logging here
})