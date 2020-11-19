import { execSync } from 'child_process';
import { join } from 'path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';

import { Service, Info, Schema, ExecutionContext } from '@nix2/service-core';

import { PACKAGES } from '../constants';
import { PackageJSONType, ESLintConfigType, TSConfigType } from '../types';

/**
 * Class to represent a Typescript Service.
 * @class TypescriptService
 */
export default abstract class TypescriptService extends Service {
    static NAME = 'typescript';

    /**
     * Constructor for the Typescript service.
     * @class TypescriptService
     * @param {ExecutionContext}        context         Context of the code execution.
     * @param {Info}                    info            `Info` object of the service.
     * @param {string}                  type            The type of Typescript service.
     * @param {Array<Schema>}           schemas         List of service schemas.
     * @param {Record<string, string>} _dependencies    Object of dependencies and their verision.
     * @param {Record<string, string>} _devDependencies Object of dev dependencies and their verision.
     * @param {Record<string, string>} _scripts         Service defined scrips for package.json.
     */
    constructor(
        context: ExecutionContext,
        info: Info,
        type: string,
        schemas: Schema[],
        private _dependencies: Record<string, string> = {},
        private _devDependencies: Record<string, string> = {},
        private _scripts: Record<string, string> = {},
    ) {
        super(context, info, type, schemas);
    }

    /**
     * Object of dependencies and their version.
     * @memberof TypescriptService
     * @function dependencies
     * @returns {Record<string, string>} Object of package name and version.
     */
    get dependencies(): Record<string, string> {
        return { ...this._dependencies, ...{} };
    }

    /**
     * Object of dev dependencies and their version.
     * @memberof TypescriptService
     * @function devDependencies
     * @returns {Record<string, string>} Object of package name and version.
     */
    get devDependencies(): Record<string, string> {
        return { ...this._devDependencies, ...PACKAGES.TYPESCRIPT.dev };
    }

    /**
     * Object of the scripts.
     * @memberof TypescriptService
     * @function scripts
     * @returns {Record<string, string>} Object of the scripts.
     */
    get scripts(): Record<string, string> {
        return { ...this._scripts, ...{} };
    }

    /**
     * Read and return the file contents of package.json.
     * @function readPackageFile
     * @memberof TypescriptService
     * @returns {PackageJSONType | null} Object of package.json or null if package.json does not exist.
     */
    readPackageFile(): PackageJSONType | null {
        const packagePath = join(this.serviceDirectory, 'package.json');
        if (!existsSync(packagePath)) {
            return null;
        }
        const fileContent = readFileSync(packagePath, 'utf-8');
        const fileObject = JSON.parse(fileContent);
        return <PackageJSONType>fileObject;
    }

    /**
     * Construct a package.json object.
     * @function makePackageContent
     * @memberof Typescript
     * @returns {PackageJSONType} Package.json object.
     */
    makePackageContent(): PackageJSONType {
        const packageContent: PackageJSONType = {
            name: this.info.identifier,
            description: this.info.description || '',
            version: this.info.version || '1.0.0',
            main: './dist/index.js',
            license: this.info.license || 'CC-BY-1.0',
            dependencies: this.dependencies,
            devDependencies: this.devDependencies,
            scripts: this.scripts,
        };
        if (this.context.user != null)
            packageContent.author = `${this.context.user.name} <${this.context.user.email}>`;
        return packageContent;
    }

    /**
     * Write the package.json object to the file.
     * @function writePackageFile
     * @memberof Typescript
     * @param {PackageJSONType} pkg Package.json object.
     * @returns {void}
     */
    writePackageFile(pkg: PackageJSONType): void {
        writeFileSync(
            join(this.serviceDirectory, 'package.json'),
            JSON.stringify(pkg, null, 4),
        );
    }

    /**
     * Create the package.json file.
     * @function createPackageFile
     * @memberof Typescript
     * @returns {void}
     */
    createPackageFile(): void {
        this.writePackageFile(this.makePackageContent());
    }

    /**
     * Return the file header as a comment.
     * @function makeFileHeader
     * @memberof TypescriptService
     * @param   {string} fileName File name for the header.
     * @returns {string}          Header for the Typescript file.
     */
    makeFileHeader(fileName: string): string {
        return (
            '/*\n' +
            this.makeFileHeaderLines(fileName)
                .map((line) => ` * ${line}`)
                .join('\n') +
            '\n*/\n'
        );
    }

    /**
     * Creates the `src/` directory.
     * @function createSourceDirectory
     * @memberof TypescriptService
     * @returns {string} Path to the source dir.
     */
    createSourceDirectory(): string {
        const sourceDir = join(this.serviceDirectory, '/src');
        if (!existsSync(sourceDir)) mkdirSync(sourceDir);
        return sourceDir;
    }

    /**
     * Make the file content for a new index.ts file.
     * @function makeMainIndexFileContent
     * @memberof TypescriptService
     * @returns {string} File content.
     */
    makeMainIndexFileContent(): string {
        return this.makeFileHeader('index.ts');
    }

    /**
     * Create all the files in `src/`.
     * @function createSourceFiles
     * @memberof TypescriptService
     * @returns {void}
     */
    createSourceFiles(): void {
        const sourceDir = this.createSourceDirectory();
        writeFileSync(
            join(sourceDir, 'index.ts'),
            this.makeMainIndexFileContent(),
        );
    }

    /**
     * Install all packages using yarn.
     * @function installPackages
     * @memberof TypescriptService
     * @returns {void}
     */
    installPackages(): void {
        execSync(`yarn --cwd ${this.serviceDirectory}`);
    }

    /**
     * Runs the post initialization commands.
     *
     * 1. Runs the base post init commands.
     * 2. Create the `package.json`.
     * 3. Create the files for `src/`.
     * 4. Create `tsconfig.json` and `tsconfig.build.json`.
     * 5. Create an eslint config file.
     * 6. Install the packages.
     * @function postInit
     * @memberof TypescriptService
     * @returns {void}
     */
    postInit(): void {
        super.postInit();
        this.createPackageFile();
        this.createSourceFiles();
        this.createTSConfig();
        this.createESLintConfig();
        this.installPackages();
    }

    /**
     * Makes the TS Config content.
     * @function makeTSConfig
     * @memberof TypescriptService
     * @returns {TSConfigType} TS Config object.
     */
    makeTSConfig(): TSConfigType {
        return {
            compilerOptions: {
                target: 'es6',
                module: 'commonjs',
                lib: ['dom', 'es6', 'es2017', 'esnext.asynciterable'],
                sourceMap: true,
                outDir: './dist',
                moduleResolution: 'node',
                declaration: true,
                removeComments: true,
                noImplicitAny: true,
                strictNullChecks: true,
                strictFunctionTypes: true,
                noImplicitThis: true,
                noUnusedLocals: false,
                noUnusedParameters: true,
                noImplicitReturns: true,
                noFallthroughCasesInSwitch: true,
                allowSyntheticDefaultImports: false,
                emitDecoratorMetadata: true,
                experimentalDecorators: true,
                allowJs: true,
            },
            exclude: ['node_modules'],
            include: ['./src/**/*.tsx', './src/**/*.ts'],
        };
    }

    /**
     * Makes the TS Build Config content.
     * @function makeTSBuildConfig
     * @memberof TypescriptService
     * @returns {TSConfigType} TS Build Config.
     */
    makeTSBuildConfig(): TSConfigType {
        return {
            extends: './tsconfig.json',
            exclude: ['node_modules', 'test', 'dist', '**/*spec.ts'],
        };
    }

    /**
     * Creates `tsconfig.json` and `tsconfig.build.json` files.
     * @function createTSConfig
     * @memberof TypescriptService
     * @returns {void}
     */
    createTSConfig(): void {
        writeFileSync(
            join(this.serviceDirectory, 'tsconfig.json'),
            JSON.stringify(this.makeTSConfig(), null, 4),
        );
        writeFileSync(
            join(this.serviceDirectory, 'tsconfig.build.json'),
            JSON.stringify(this.makeTSBuildConfig(), null, 4),
        );
    }

    /**
     * Runs the post version bump commands.
     *
     * 1. Runs the base version bump commands.
     * 2. Update the `package.json` version.
     * @function postVersionBump
     * @memberof TypescriptService
     * @returns {void}
     */
    postVersionBump(): void {
        super.postVersionBump();
        const pkg = this.readPackageFile();
        if (pkg == null) return;
        pkg.version = this.info.version;
        this.writePackageFile(pkg);
    }

    /**
     * Make the ingore components to get sent to the ignore generation service.
     * @function makeIgnoreComponents
     * @memberof TypescriptService
     * @returns {string[]} Ignore components.
     */
    makeIgnoreComponents(): string[] {
        return super.makeIgnoreComponents().concat(['node']);
    }

    /**
     * Makes an eslint config object.
     * @function makeESLintConfig
     * @memberof TypescriptService
     * @returns {ESLintConfigType} ESLint config object.
     */
    makeESLintConfig(): ESLintConfigType {
        return {
            env: {
                node: true,
                es6: true,
            },
            extends: [
                'eslint:recommended',
                'plugin:@typescript-eslint/recommended',
            ],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                ecmaVersion: 12,
                sourceType: 'module',
            },
            plugins: ['@typescript-eslint', 'jsdoc'],
            rules: {
                '@typescript-eslint/ban-ts-comment': 1,
                '@typescript-eslint/no-unused-vars': [
                    2,
                    {
                        argsIgnorePattern: '^_',
                    },
                ],
                '@typescript-eslint/explicit-module-boundary-types': 2,
                'no-warning-comments': [
                    1,
                    {
                        terms: ['todo', 'fixme', 'xxx'],
                        location: 'start',
                    },
                ],
                'jsdoc/require-jsdoc': [
                    2,
                    {
                        require: {
                            FunctionDeclaration: true,
                            MethodDefinition: true,
                            ClassDeclaration: true,
                            ArrowFunctionExpression: false,
                            FunctionExpression: false,
                        },
                    },
                ],
                'jsdoc/require-description': 2,
                'jsdoc/require-description-complete-sentence': 2,
                'jsdoc/implements-on-classes': 2,
                'jsdoc/check-types': 2,
                'jsdoc/valid-types': 2,
                'jsdoc/require-param': 2,
                'jsdoc/require-param-name': 2,
                'jsdoc/require-param-type': 2,
                'jsdoc/require-param-description': 2,
                'jsdoc/check-param-names': 2,
                'jsdoc/require-returns': 2,
                'jsdoc/require-returns-type': 2,
                'jsdoc/require-returns-description': 2,
                'jsdoc/check-tag-names': 2,
            },
        };
    }

    /**
     * Creates an ESLint config file.
     * @function createESLintConfig
     * @memberof TypescriptService
     * @returns {void}
     */
    createESLintConfig(): void {
        writeFileSync(
            join(this.serviceDirectory, '.eslintrc.json'),
            JSON.stringify(this.makeESLintConfig(), null, 4),
        );
    }
}
