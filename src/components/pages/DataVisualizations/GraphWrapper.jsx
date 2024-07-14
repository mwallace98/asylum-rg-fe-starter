import React, { useEffect,useState,useCallback } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import CitizenshipMapAll from './Graphs/CitizenshipMapAll';
import CitizenshipMapSingleOffice from './Graphs/CitizenshipMapSingleOffice';
import TimeSeriesAll from './Graphs/TimeSeriesAll';
import OfficeHeatMap from './Graphs/OfficeHeatMap';
import TimeSeriesSingleOffice from './Graphs/TimeSeriesSingleOffice';
import YearLimitsSelect from './YearLimitsSelect';
import ViewSelect from './ViewSelect';
import axios from 'axios';
import { resetVisualizationQuery } from '../../../state/actionCreators';
import test_data from '../../../data/test_data.json';
import { colors } from '../../../styles/data_vis_colors';
import ScrollToTopOnMount from '../../../utils/scrollToTopOnMount';


const { background_color } = colors;
const URL = 'https://hrf-asylum-be-b.herokuapp.com/cases';

function GraphWrapper(props) {
  const { set_view, dispatch } = props;
  let { office, view } = useParams();
  const[data,setData] = useState(null);

  useEffect(() => {
    const getFiscalSummaryData = async () => {
      try {
        const res = await axios.get(`${URL}/fiscalsummary`);
        let fiscalSummaryData = [];
        let modifiedData = {
          ...res.data,
          yearResults: res.data.yearResults.map(yearResult => ({
            ...yearResult,
            denied: 100 - yearResult.granted,
            yearData: yearResult.yearData.map(yearDataItem => ({
              ...yearDataItem,
              denied: 100 - yearDataItem.granted
            }))
          }))
        };
        fiscalSummaryData.push(modifiedData);
        setData(fiscalSummaryData);
      } catch (err) {
        console.log(err);
      }
    };

    const getCitizenshipSummaryData = async () => {
      console.log('citizenship data loaded');
      try {
        const res = await axios.get(`${URL}/citizenshipSummary`);
        let CitizenshipData = [];
        CitizenshipData.push(res.data);
        setData(CitizenshipData);
      } catch (err) {
        console.log(err);
      }
    };

    if (view === 'citizenship') {
      getCitizenshipSummaryData();
    } else {
      getFiscalSummaryData();
    }
  }, [view]); 

  if (!view) {
    set_view('time-series');
    view = 'time-series';
  }
  
  let map_to_render;
  if (!office) {
    switch (view) {
      case 'time-series':
        map_to_render = <TimeSeriesAll data={data}/>;
        break;
      case 'office-heat-map':
        map_to_render = <OfficeHeatMap data={data}/>;
        break;
      case 'citizenship':
        map_to_render = <CitizenshipMapAll data={data}/>;
        break;
      default:
        break;
    }
  } else {
    switch (view) {
      case 'time-series':
        map_to_render = <TimeSeriesSingleOffice office={office} data={data}/>;
        
        break;
      case 'citizenship':
        map_to_render = <CitizenshipMapSingleOffice office={office} data={data}/>;
        break;
      default:
        break;
    }
  }

  


  function updateStateWithNewData(years, view, office,stateSettingCallback) {

    /*
          _                                                                             _
        |                                                                                 |
        |   Example request for once the `/summary` endpoint is up and running:           |
        |                                                                                 |
        |     `${url}/summary?to=2022&from=2015&office=ZLA`                               |
        |                                                                                 |
        |     so in axios we will say:                                                    |
        |                                                                                 |     
        |       axios.get(`${url}/summary`, {                                             |
        |         params: {                                                               |
        |           from: <year_start>,                                                   |
        |           to: <year_end>,                                                       |
        |           office: <office>,       [ <-- this one is optional! when    ]         |
        |         },                        [ querying by `all offices` there's ]         |
        |       })                          [ no `office` param in the query    ]         |
        |                                                                                 |
          _                                                                             _
                                   -- Mack 
    
    */
  
   const  params= {
    from:years[0],
    to:years[1],
    office: office !== 'all' && office ? office : undefined
  };
    
    if (office === 'all' || !office) {
      axios.get(`${URL}`,{params})
      .then(res => {    
        
        stateSettingCallback(view,office,data);
        console.log(data,'data insisde office all');
      })
      .catch(err => {
        console.log(err);
      });
    } else {
      axios
        .get(`${URL}`,{params})
        .then(res => {
          console.log(res.data,'res.data');
          console.log('data inside office select',data);
          stateSettingCallback(view, office, data); // <-- `test_data` here can be simply replaced by `result.data` in prod!
          
        })
        .catch(err => {
          console.error(err,'error');
          
        });
    }
  }
  const clearQuery = (view, office) => {
    dispatch(resetVisualizationQuery(view, office));
  };

 

  return (
    <div
      className="map-wrapper-container"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        minHeight: '50px',
        backgroundColor: background_color,
      }}
    >
      <ScrollToTopOnMount />
      {map_to_render}
      <div
        className="user-input-sidebar-container"
        style={{
          width: '300px',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <ViewSelect set_view={set_view} />
        <YearLimitsSelect
          view={view}
          office={office}
          clearQuery={clearQuery}
          updateStateWithNewData={updateStateWithNewData}
        />
      </div>
    </div>
  );
}

export default connect()(GraphWrapper);
