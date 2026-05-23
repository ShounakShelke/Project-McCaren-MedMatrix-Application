// Type declarations for packages that ship without their own @types

declare module "node-tesseract-ocr" {
    interface TesseractConfig {
        lang?: string;
        oem?: number;
        psm?: number;
        [key: string]: string | number | undefined;
    }

    function recognize(imagePath: string, config?: TesseractConfig): Promise<string>;

    export = recognize;
}
