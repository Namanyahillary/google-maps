import { createElement } from "react";
import { ShallowWrapper, configure, shallow } from "enzyme";
import Adapter = require("enzyme-adapter-react-16");
import GoogleMap from "google-map-react";

import { Map, MapProps, heightUnitType, widthUnitType } from "../Map";
import { Marker } from "../Marker";
import { Alert } from "../Alert";
import { Location } from "../../utils/ContainerUtils";

// tslint:disable:no-submodule-imports
import { mockGoogleMaps } from "tests/mocks/GoogleMaps";
import { mockMendix } from "tests/mocks/Mendix";

configure({ adapter: new Adapter() });

describe("Map", () => {
    const address = "Lumumba Ave, Kampala, Uganda";
    const invalidAddress = "invalidAddress";
    const APIKey = "AIzaSyACjBNesZXeRFx86N7RMCWiTQP5GT_jDec";
    const renderMap = (props: MapProps) => shallow(createElement(Map, props));
    const defaultCenterLocation = { lat: 51.9107963, lng: 4.4789878 };
    let mxOriginal: mx.MxInterface;

    const setUpMap = (
        locationsParam: Location[], APIKeyParam?: string,
        widthParam?: number,
        heightParam?: number,
        widthUnitParam?: widthUnitType,
        heightUnitParam?: heightUnitType,
        defaultCenterParam?: string): ShallowWrapper<MapProps, any> => {
        const output = renderMap({
            apiKey: APIKeyParam,
            autoZoom: true,
            defaultCenterAddress: defaultCenterParam !== undefined ? defaultCenterParam : "",
            height: heightParam ? heightParam : 75,
            heightUnit: heightUnitParam ? heightUnitParam : "pixels",
            locations: locationsParam,
            optionDrag: true,
            optionMapControl: true,
            optionScroll: true,
            optionStreetView: true,
            optionZoomControl: true,
            style: {},
            mapStyles: "",
            width: widthParam ? widthParam : 100,
            widthUnit: widthUnitParam ? widthUnitParam : "pixels",
            zoomLevel: 7
        });
        // (output.find(GoogleMap).prop("onGoogleApiLoaded") as any).apply();
        const googleMap = output.find(GoogleMap);
        const googleMapProps = googleMap.props();

        if (googleMapProps && googleMapProps.onGoogleApiLoaded) {
            googleMapProps.onGoogleApiLoaded({
                map: google.maps as any,
                maps: google.maps
            });
        }
        return output;
    };

    beforeAll(() => {
        mxOriginal = window.mx;
        window.google = mockGoogleMaps;
        window.mx = mockMendix;
    });

    it("should render with the map structure", () => {
        const map = setUpMap([ { address } ], undefined, 100, 75, "percentage", "percentageOfWidth");
        const style = { paddingBottom: "75%", width: "100%" };

        expect(map).toBeElement(
            createElement("div", { className: "widget-google-maps-wrapper", style },
                createElement("div", { className: "widget-google-maps" },
                    createElement(Alert, {
                        bootstrapStyle: "danger",
                        className: "widget-google-maps-alert",
                        message: undefined
                    }),
                    createElement(GoogleMap, {
                        bootstrapURLKeys: { key: undefined },
                        center: defaultCenterLocation,
                        defaultZoom: 7,
                        onGoogleApiLoaded: jasmine.any(Function) as any,
                        resetBoundsOnResize: true,
                        yesIWantToUseGoogleMapApiInternals: true
                    })
                )
            ));
    });

    it("should render a structure correctly with pixels", () => {
        const map = setUpMap([ { address } ], undefined, 100, 75, "pixels", "pixels");
        const style = { paddingBottom: "75px", width: "100px" };

        expect(map).toBeElement(
            createElement("div", { className: "widget-google-maps-wrapper", style },
                createElement("div", { className: "widget-google-maps" },
                    createElement(Alert, {
                        bootstrapStyle: "danger",
                        className: "widget-google-maps-alert",
                        message: undefined
                    }),
                    createElement(GoogleMap, {
                        bootstrapURLKeys: { key: undefined },
                        center: defaultCenterLocation,
                        defaultZoom: 7,
                        onGoogleApiLoaded: jasmine.any(Function) as any,
                        resetBoundsOnResize: true,
                        yesIWantToUseGoogleMapApiInternals: true
                    })
                )
            ));
    });

    it("should render a structure correctly with percentage", () => {
        const map = setUpMap([ { address } ], undefined, 20, 30, "percentage", "pixels");
        const style = { width: "20%", paddingBottom: "30px" };

        expect(map).toBeElement(
            createElement("div", { className: "widget-google-maps-wrapper", style },
                createElement("div", { className: "widget-google-maps" },
                    createElement(Alert, {
                        bootstrapStyle: "danger",
                        className: "widget-google-maps-alert",
                        message: undefined
                    }),
                    createElement(GoogleMap, {
                        bootstrapURLKeys: { key: undefined },
                        center: defaultCenterLocation,
                        defaultZoom: 7,
                        onGoogleApiLoaded: jasmine.any(Function) as any,
                        resetBoundsOnResize: true,
                        yesIWantToUseGoogleMapApiInternals: true
                    })
                )
            ));
    });

    it("should render a structure correctly with percentage of parent", () => {
        const map = setUpMap([ { address } ], undefined, 20, 30, "percentage", "percentageOfParent");
        const style = { width: "20%", height: "30%" };

        expect(map).toBeElement(
            createElement("div", { className: "widget-google-maps-wrapper", style },
                createElement("div", { className: "widget-google-maps" },
                    createElement(Alert, {
                        bootstrapStyle: "danger",
                        className: "widget-google-maps-alert",
                        message: undefined
                    }),
                    createElement(GoogleMap, {
                        bootstrapURLKeys: { key: undefined },
                        center: defaultCenterLocation,
                        defaultZoom: 7,
                        onGoogleApiLoaded: jasmine.any(Function) as any,
                        resetBoundsOnResize: true,
                        yesIWantToUseGoogleMapApiInternals: true
                    })
                )
            ));
    });

    describe("with no address", () => {
        it("should not look up the location", () => {
            spyOn(window.google.maps.Geocoder.prototype, "geocode").and.callThrough();

            setUpMap([ { address: "" } ]);

            expect(window.google.maps.Geocoder.prototype.geocode).not.toHaveBeenCalled();
        });

        it("should not display a marker", () => {
            const output = setUpMap([ { address: "" } ]);

            const marker = output.find(Marker);

            expect(marker.length).toBe(0);
        });

        it("should center to the default address if no coordinates", () => {
            const output = setUpMap([ { address: "" } ], undefined, 100, 75, "pixels", "pixels", "");

            expect(output.state("center").lat).toBe(defaultCenterLocation.lat);
            expect(output.state("center").lng).toBe(defaultCenterLocation.lng);
        });

        it("should center to the coordinates if provided", () => {
            const coordinateLocation = { lat: 21.2, lng: 1.5 };

            const output = setUpMap([ { latitude: coordinateLocation.lat, longitude: coordinateLocation.lng } ]);

            expect(output.state("locations")[0].latitude).toBe(coordinateLocation.lat);
            expect(output.state("locations")[0].longitude).toBe(coordinateLocation.lng);
        });
    });

    describe("with a valid address", () => {
        it("should lookup the location", () => {
            spyOn(window.google.maps.Geocoder.prototype, "geocode");

            setUpMap([ { address } ]);

            expect(window.google.maps.Geocoder.prototype.geocode).toHaveBeenCalled();
        });
    });

    describe("with an invalid address", () => {
        it("should not render a marker", () => {
            const output = setUpMap([ { address: invalidAddress } ]);

            const marker = output.find(Marker);
            expect(marker.length).toBe(0);
        });

        it("should have no marker if no coordinate is provided", () => {
            const output = setUpMap([ { address: invalidAddress } ]);

            const marker = output.find(Marker);

            expect(marker.length).toBe(0);
        });

        it("should display an error", () => {
            const actionErrorMessage = `Can not find address ${invalidAddress}`;
            spyOn(window.mx.ui, "error").and.callThrough();

            const output = setUpMap([ { address: invalidAddress } ]);
            const mapComponent = output.instance();

            expect(mapComponent.state.alertMessage).toBe(actionErrorMessage);
        });

        it("should have a marker if coordinates are provided", () => {
            const coordinateLocation = { lat: 21.2, lng: 1.5 };

            const output = setUpMap([ { latitude: coordinateLocation.lat, longitude: coordinateLocation.lng } ]);

            expect(output.state("locations")[0].latitude).toBe(coordinateLocation.lat);
            expect(output.state("locations")[0].longitude).toBe(coordinateLocation.lng);
        });
    });

    describe("loads", () => {
        it("if no API key is configured", () => {
            const output = setUpMap([ { address } ]);

            expect((output.find(GoogleMap).prop("bootstrapURLKeys") as any).key).not.toBe(APIKey);
        });

        it("when API key is configured", () => {
            const output = setUpMap([ { address } ], APIKey);

            expect((output.find(GoogleMap).prop("bootstrapURLKeys") as any).key).toBe(APIKey);
        });
    });

    afterAll(() => {
        window.mx = mxOriginal;
        window.google = undefined;
    });
});
