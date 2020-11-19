export default interface TSConfigType {
    extends?: string;
    compilerOptions?: {
        target?:
            | 'es3'
            | 'es5'
            | 'es6'
            | 'es2015'
            | 'es7'
            | 'es2016'
            | 'es2017'
            | 'es2018'
            | 'es2019'
            | 'es2020'
            | 'esnext';
        module?:
            | 'commonjs'
            | 'es6'
            | 'es2015'
            | 'es2020'
            | 'none'
            | 'umd'
            | 'amd'
            | 'system'
            | 'esnext';
        lib?: string[];
        sourceMap?: boolean;
        outDir?: string;
        moduleResolution?: 'node' | 'classic';
        declaration?: boolean;
        removeComments?: boolean;
        noImplicitAny?: boolean;
        strictNullChecks?: boolean;
        strictFunctionTypes?: boolean;
        noImplicitThis?: boolean;
        noUnusedLocals?: boolean;
        noUnusedParameters?: boolean;
        noImplicitReturns?: boolean;
        noFallthroughCasesInSwitch?: boolean;
        allowSyntheticDefaultImports?: boolean;
        emitDecoratorMetadata?: boolean;
        experimentalDecorators?: boolean;
        allowJs?: boolean;
        incremental?: boolean;
        baseUrl?: string;
    };
    exclude?: string[];
    include?: string[];
}
