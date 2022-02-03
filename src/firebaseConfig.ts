// Sourced from - https://docs.microsoft.com/en-us/javascript/api/@azure/keyvault-certificates/requireatleastone?view=azure-node-latest
type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> &
    Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];

// should be sourced from - https://github.com/firebase/firebase-tools/blob/master/src/deploy/functions/runtimes/index.ts#L15
type CloudFunctionRuntimes = "nodejs10" | "nodejs12" | "nodejs14" | "nodejs16";

type Deployable = {
  /**
   * Pre-deploy lifecycle hook - commands in the string array are sequentially executed. If any one of them fails the function will not deploy and the postdeploy lifecycle hook will not run.
   */
  predeploy?: string | string[];
  /**
   * Post-deploy lifecycle hook will only execute if pre-deploy and function deployment completed successfully.
   */
  postdeploy?: string | string[];
};

type DatabaseSingle = {
  /**
   * Points to the file that contains security rules for your Realtime Database.
   */
  rules: string;
} & Deployable;

type DatabaseMultiple = ({
  /**
   * Points to the file that contains Realtime Database security rules
   */
  rules: string;
} & RequireAtLeastOne<{
  instance: string;
  /**
   * Define a database target name to which you apply your security rules file
   */
  target: string;
}> &
  Deployable)[];

type HostingSource =
  | { glob: string }
  | {
      /**
       * A glob pattern that is matched against all URL paths at the start of every request
       *
       * A glob specifying a rewrite rule
       *
       * Matched against the original request path, regardless of rewrite rules
       */
      source: string;
    }
  | {
      /**
       *  RE2 regular expression
       */
      regex: string;
    };

type HostingRedirects = HostingSource & {
  /**
   * The value used within the Location header entry
   */
  destination: string;
  /**
   * The redirect status code
   * 301 | 302;
   */
  type?: number;
};

export type HostingRewrites = HostingSource &
  (
    | {
        /**
         * A local destination
         */
        destination: string;
      }
    | {
        /**
         * Directs a request to a http cloud function
         * (limitation: only support functions on us-central1 region)
         */
        function: string;
      }
    | {
        /**
         * Directs a request to a Cloud Run containerized app
         */
        run: {
          /**
           * "service name" (from when you deployed the container image)
           */
          serviceId: string;
          /**
           * optional (if omitted, default is us-central1)
           */
          region?: string;
        };
      }
    | {
        /**
         * Enable Dynamic Links
         */
        dynamicLinks: boolean;
      }
  );

export type HostingHeaders = HostingSource & {
  headers: {
    /**
     * The header key
     */
    key: string;
    /**
     * The header value
     */
    value: string;
  }[];
};

type HostingBase = {
  /**
   * The directory that gets uploaded to firebase
   */
  public?: string;
  /**
   * Specifies files to ignore on deploy
   */
  ignore?: string[];
  /**
   * The default for appAssociation is AUTO.
   * By setting this attribute to AUTO, hosting can dynamically generate assetlinks.json and apple-app-site-association files when they're requested.
   */
  appAssociation?: string;
  /**
   * If true, firebase will drop all .html extensions from file uploads
   */
  cleanUrls?: boolean;
  /**
   * Controls whether URLs should have trailing slashes or not
   */
  trailingSlash?: boolean;
  /**
   * Specifies all http redirects
   */
  redirects?: HostingRedirects[];
  /**
   * Holds rules for rewrites
   */
  rewrites?: HostingRewrites[];
  /**
   * An array of custom header definitions
   */
  headers?: HostingHeaders[];
  /**
   * Set up i18n rewrites
   */
  i18n?: {
    /**
     * Directory that contains your "i18n content"
     */
    root: string;
  };
};

type HostingSingle = HostingBase & {
  site?: string;
  /**
   * Deploy targets are short-name identifiers (that you define yourself) for Firebase resources in your Firebase project, like a Hosting site with unique static assets or a group of Realtime Database instances that share the same security rules.
   * See: https://firebase.google.com/docs/cli/targets
   *
   * To create a deploy target and apply a target-name to a Hosting site, run the following CLI command:
   * firebase target:apply type target-name resource-name
   *
   */
  target?: string;
} & Deployable;

type HostingMultiple = (HostingBase &
  RequireAtLeastOne<{
    site: string;
    target: string;
  }> &
  Deployable)[];

type StorageSingle = {
  /**
   * Points to the file that contains security rules for storage buckets
   */
  rules: string;
  /**
   * Define a resource target to which you apply your storage security rules file
   */
  target?: string;
} & Deployable;

type StorageMultiple = ({
  rules: string;
  bucket: string;
  target?: string;
} & Deployable)[];

// Full Configs
export type DatabaseConfig = DatabaseSingle | DatabaseMultiple;

export type FirestoreConfig = {
  /**
   * Points to the file that contains security rules for Firestore
   */
  rules?: string;
  /**
   * Points to the file that defines indexes for Firestore
   */
  indexes?: string;
} & Deployable;

export type FunctionsConfig = {
  /**
   * Point to the functions folder, default to "functions"
   */
  source?: string;
  ignore?: string[];

  runtime?: CloudFunctionRuntimes;
} & Deployable;

export type HostingConfig = HostingSingle | HostingMultiple;

export type StorageConfig = StorageSingle | StorageMultiple;

export type RemoteConfigConfig = {
  /**
   * Template file
   */
  template: string;
} & Deployable;

export type EmulatorsConfig = {
  auth?: {
    host?: string;
    port?: number;
  };
  database?: {
    host?: string;
    port?: number;
  };
  firestore?: {
    host?: string;
    port?: number;
  };
  functions?: {
    host?: string;
    port?: number;
  };
  hosting?: {
    host?: string;
    port?: number;
  };
  pubsub?: {
    host?: string;
    port?: number;
  };
  storage?: {
    host?: string;
    port?: number;
  };
  logging?: {
    host?: string;
    port?: number;
  };
  hub?: {
    host?: string;
    port?: number;
  };
  ui?: {
    /**
     * Default is `true`
     * */
    enabled?: boolean;
    host?: string;
    port?: number | string;
  };
};

export type ExtensionsConfig = Record<string, string>;

export type FirebaseConfig = {
  /**
   * Realtime Database configuration - Define either one database rules set or multiple targets each with its own unique rules file that contains the security rules for the corresponding realtime database.
   */
  database?: DatabaseConfig;
  /**
   * Firestore configuration - define the Firestore security rules file to be deployed and also define Firestore indexes
   */
  firestore?: FirestoreConfig;
  /**
   * You can define pre-deploy and post-deploy scripts in your functions configuration in firebase.json
   */
  functions?: FunctionsConfig;
  /**
   * Holds the main configuration entries
   */
  hosting?: HostingConfig;
  /**
   * Either define shared security rules which will apply to all of your storage buckets or define multiple targets each with its own unique file that contains the security rules for the corresponding storage bucket.
   */
  storage?: StorageConfig;
  /**
   * Change the behavior and appearance of your app without publishing an app update
   */
  remoteconfig?: RemoteConfigConfig;
  /**
   * Optional emulator configuration. Default values are used if absent.
   */
  emulators?: EmulatorsConfig;
  extensions?: ExtensionsConfig;
};
