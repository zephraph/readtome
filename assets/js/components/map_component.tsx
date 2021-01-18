import * as React from "react";
import ReactMapboxGl, { Feature, Layer, Marker, Popup } from "react-mapbox-gl";

import { Coordinate } from "../models/coordinate";
import { svg } from "./icon";
import { UserInterest } from "../models/user_interest";
import { UserInterestMarker } from "./user_interest_marker";
import { Icon } from "semantic-ui-react";

const Map = ReactMapboxGl({
  accessToken:
    "pk.eyJ1IjoiYXNoa2FuMTgiLCJhIjoiY2pzdnk5eGRpMGMxcTN5bzRsOHRjdDR2cCJ9.qaLMKiKsDDLnMPLJ-s4rIQ",
  minZoom: 8,
  maxZoom: 15,
});

const mapStyle = {
  flex: 1,
};

const flyToOptions = {
  speed: 0.8,
};

const layoutLayer = { "icon-image": "londonCycle" };

// Create an image for the Layer
const image = new Image();
image.src = "data:image/svg+xml;charset=utf-8;base64," + btoa(svg);
const images: any = ["londonCycle", image];

interface Props {
  userInterests: Array<UserInterest>;
  center: Coordinate;
  onStyleLoad?: (map: any) => any;
  switchPage?: (any) => void;
}

interface State {
  userInterest?: UserInterest;
  zoom: number;
  centerLat?: number;
  centerLng?: number;
}

interface Action {
  type: string;
  item?: UserInterest;
  coordinate?: { lat: number; lng: number };
}

const reducer = (state, action) => {
  switch (action.type) {
    case "INSTANCE_SELECTED":
      const userInterest = action.item;
      return {
        ...state,
        userInterest: userInterest,
        zoom: 15,
        centerLat: userInterest.location.lat,
        centerLng: userInterest.location.lng,
      };
    case "RESET_SELECT":
      if (state.userInterest !== undefined)
        return { ...state, userInterest: undefined };
      else return state;
    case "GOT_SEARCH_RESULTS":
      if (state.userInterest !== undefined)
        return { ...state, userInterest: undefined };
      else return state;
    case "GOT_CURRENT_LOCATION":
      if (action.coordinate !== null) {
        return {
          ...state,
          centerLat: action.coordinate.lat,
          centerLng: action.coordinate.lng,
        };
      } else {
        return state;
      }

    default:
      return state;
  }
};

export const MapComponent = (props: Props) => {
  const initialState = {
    userInterests: props.userInterests,
    zoom: 13,
  };

  const [state, dispatch] = React.useReducer<React.Reducer<State, Action>>(
    reducer,
    initialState
  );

  const onDrag = () => {
    dispatch({ type: "RESET_SELECT" });
  };
  const onToggleHover = (cursor: string, { map }: { map: any }) => {
    map.getCanvas().style.cursor = cursor;
  };

  const onMarkerClick = (userInterest: UserInterest) => {
    dispatch({ type: "INSTANCE_SELECTED", item: userInterest });
  };

  React.useEffect(() => {
    dispatch({ type: "GOT_CURRENT_LOCATION", coordinate: props.center });
  }, [props.center]);

  React.useEffect(() => {
    dispatch({ type: "GOT_SEARCH_RESULTS" });
  }, [props.userInterests]);

  return (
    <Map
      style="mapbox://styles/ashkan18/ckhzblkri2mr719n224l706o0"
      containerStyle={mapStyle}
      flyToOptions={flyToOptions}
      onDrag={onDrag}
      center={state.centerLng && [state.centerLng, state.centerLat]}
      zoom={[state.zoom]}
      movingMethod={"easeTo"}
    >
      <Marker coordinates={[props.center.lng, props.center.lat]}>
        <Icon name="user circle outline" color="orange" size="big" />
      </Marker>
      <Layer type="symbol" id="marker" layout={layoutLayer} images={images}>
        {props.userInterests?.map((bi, index) => (
          <Feature
            key={bi.id}
            onMouseEnter={onToggleHover.bind(this, "pointer")}
            onMouseLeave={onToggleHover.bind(this, "")}
            onClick={() => onMarkerClick(bi)}
            coordinates={[bi.location.lng, bi.location.lat]}
          />
        ))}
      </Layer>

      {state.userInterest && (
        <Popup
          coordinates={[
            state.userInterest.location.lng,
            state.userInterest.location.lat,
          ]}
          anchor="bottom"
          offset={[0, -15]}
        >
          <UserInterestMarker userInterest={state.userInterest} />
        </Popup>
      )}
    </Map>
  );
};
