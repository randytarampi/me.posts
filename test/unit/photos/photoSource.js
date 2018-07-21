import {expect} from "chai";
import {after, before, describe, it} from "mocha";
import PhotoSource from "../../../photos/photoSource";

describe("PhotoSource", () => {
    before(() => {
        process.env._API_KEY = "woof";
        process.env._API_SECRET = "meow";
    });

    after(() => {
        delete process.env._API_KEY;
        delete process.env._API_SECRET;
    });

    describe("constructor", () => {
        it("should build a `PhotoSource` instance", () => {
            const photoSource = new PhotoSource();

            expect(photoSource.type).to.eql(undefined);
            expect(photoSource.client).to.be.undefined;
            expect(photoSource.initializing).to.be.instanceOf(Promise);
            expect(photoSource).to.be.instanceOf(PhotoSource);
        });

        it("should accept an `initalizerPromise`", () => {
            const photoSource = new PhotoSource("Woof", "Grr", Promise.resolve("Meow"));

            expect(photoSource.type).to.eql("Woof");
            expect(photoSource.client).to.eql("Grr");
            expect(photoSource.initializing).to.be.instanceOf(Promise);
            expect(photoSource).to.be.instanceOf(PhotoSource);

            return photoSource.initializing
                .then((initializingResult) => {
                    expect(initializingResult).to.eql(photoSource);
                    expect(initializingResult.client).to.eql("Meow");
                });
        });
    });

    describe("#getUserPhotos", () => {
        it("should throw a `Please specify an actual get photo for user implementation` error", () => {
            const photoSource = new PhotoSource();

            return photoSource.getUserPhotos()
                .catch((error) => {
                    expect(error.message).to.match(/Please specify an actual get photo for user implementation/);
                });
        });
    });

    describe("#getPhoto", () => {
        it("should throw a `Please specify an actual get photo implementation` error", () => {
            const photoSource = new PhotoSource();

            return photoSource.getPhoto()
                .catch((error) => {
                    expect(error.message).to.match(/Please specify an actual get photo implementation/);
                });
        });
    });

    describe("#jsonToPhoto", () => {
        it("should throw a `Please specify an actual Photo transformation` error", () => {
            const photoSource = new PhotoSource();

            expect(photoSource.jsonToPhoto).to.throw(/Please specify an actual Photo transformation/);
        });
    });

    describe("#isEnabled", () => {
        it("should be enabled if it can find some `_API_KEY` and some `_API_SECRET`", () => {
            const photoSource = new PhotoSource();

            expect(photoSource.isEnabled).to.eql(true);
        });

        it("should not be enabled if it cannot find `_API_KEY`", () => {
            delete process.env._API_KEY;

            const photoSource = new PhotoSource();

            expect(photoSource.isEnabled).to.eql(false);
        });

        it("should not be enabled if it cannot find `_API_SECRET`", () => {
            delete process.env._API_SECRET;

            const photoSource = new PhotoSource();

            expect(photoSource.isEnabled).to.eql(false);
        });
    });
});
