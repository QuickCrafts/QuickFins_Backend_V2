import DependenyInjectionCompositionRoot from "./diCompositionRoot";
import UserRepository, {IUserRepository} from "../../repositories/userRepository";
import MongoDBClient, {IMongoDBClient} from "../mongoDB.config";
import MSGraphClient, {IMSGraphClient} from "../msGraph.config";
import MSAuthClient,{IMSAuthClient} from "../msAuth.config";

export default async function setupDependencyInjection(){
    // Singleton instances, not initialized yet as they will be initialized in the application start
    const mongoDBClient = await MongoDBClient.getInstance();
    const msGraphClient = MSGraphClient.getInstance();
    const msAuthClient = MSAuthClient.getInstance();

    DependenyInjectionCompositionRoot.register<IMongoDBClient>("mongodbClient", () => mongoDBClient);

    DependenyInjectionCompositionRoot.register<IUserRepository>("userRepository", UserRepository, ["mongodbClient"]);

    DependenyInjectionCompositionRoot.register<IMSGraphClient>("msGraphClient", () => msGraphClient);

    DependenyInjectionCompositionRoot.register<IMSAuthClient>("msAuthClient", () => msAuthClient);

}