import * as React from "react"
import ReactMapboxGl, { Feature, Layer, Marker, Popup } from 'react-mapbox-gl';

import Coordinate from "../models/coordinate"
import BookInstance from "../models/book_instance"
import {GeolocateControl} from "mapbox-gl"
import BookInstanceDetail from "./book_instance_detail";
import { svg } from "./icon";


const Map = ReactMapboxGl({
  accessToken: "pk.eyJ1IjoiYXNoa2FuMTgiLCJhIjoiY2pzdnk5eGRpMGMxcTN5bzRsOHRjdDR2cCJ9.qaLMKiKsDDLnMPLJ-s4rIQ",
  minZoom: 8,
  maxZoom: 15,
});

const mapStyle = {
  flex: 1
};

const flyToOptions = {
  speed: 0.8
};

const layoutLayer = { 'icon-image': 'londonCycle' };

// Create an image for the Layer
const image = new Image();
image.src = 'data:image/svg+xml;charset=utf-8;base64,' + btoa(svg);
const images: any = ['londonCycle', image];


interface Props{
  bookInstances: Array<BookInstance>
  initialCoordinate: Coordinate
  onStyleLoad?: (map: any) => any
}

interface State {
  bookInstance?: BookInstance
  zoom: number
  centerLat: number
  centerLng: number
}

interface Action {
  type: string
  item?: BookInstance
}

const reducer = (state, action) => {
  switch (action.type) {
    case "INSTANCE_SELECTED":
      const bookInstance = action.item
      return {...state, 
        bookInstance: bookInstance,
        zoom: 15,
        centerLat: bookInstance.location.lat,
        centerLng: bookInstance.location.lng 
      }
    case "RESET_SELECT":
      if (state.selectedBookInstance) {
        return {...state, bookInstance: undefined}
      } else {
        return state
      }
    default:
      return state
    }
}

export const MapComponent = (props: Props) => {
  
  const geoLocation = new GeolocateControl({
    positionOptions: {
      enableHighAccuracy: false
    },
    trackUserLocation: false
  })

  const initialState = {
    bookInstance: undefined,
    zoom: 13,
    centerLat: props.initialCoordinate.lat,
    centerLng: props.initialCoordinate.lng
  }

  

  const [state, dispatch] = React.useReducer<React.Reducer<State, Action>> (reducer, initialState)
  
  const onDrag = () => {
    if (state.bookInstance) {
      dispatch({ type: 'RESET_SELECT' })
    }
  }
  const onToggleHover = (cursor: string, { map }: { map: any }) => {
    map.getCanvas().style.cursor = cursor;
  }

  const onMarkerClick = (bookInstance: BookInstance) => {
    dispatch({ type: 'INSTANCE_SELECTED', item: bookInstance })
  }


  const onStyleLoad = (map: any) => {
    const { onStyleLoad } = props;
    map.addControl(geoLocation);
    setTimeout(() => {
      geoLocation.trigger()
    }, 500);
    return onStyleLoad && onStyleLoad(map);
  }
  
  return(
    <Map
      style="mapbox://styles/ashkan18/ckhzblkri2mr719n224l706o0"
      containerStyle={mapStyle}
      flyToOptions={flyToOptions}
      onStyleLoad={onStyleLoad}
      onDrag={onDrag}
      center={[state.centerLng, state.centerLat]}
      zoom={[state.zoom]}
      >
        <Layer type="symbol" id="marker" layout={layoutLayer} images={images}>
          {props.bookInstances?.map((bi, index) => (
            <Feature
              key={bi.id}
              onMouseEnter={onToggleHover.bind(this, 'pointer')}
              onMouseLeave={onToggleHover.bind(this, '')}
              onClick={() => onMarkerClick(bi)}
              coordinates={[bi.location.lng, bi.location.lat]}
            />
          ))}
        </Layer>
        
      { state.bookInstance &&
        <Popup
          coordinates={[state.bookInstance.location.lng, state.bookInstance.location.lat]}
          anchor="bottom"
          offset={[0, -15]}>
          <BookInstanceDetail bookInstance={state.bookInstance}/>
        </Popup>
      }
    </Map>
  )

}
