import React, { useEffect } from "react";
import { ForecastFrame, CurrentMain } from "../../styles/pages/homeStyles";
import {
  CurrentHeader,
  CurrentForecast,
  CurrentCityText,
  CurrentCountryText,
  CurrentInfoFrame,
  CurrentTemperature,
  CurrentWeatherIcon,
} from "../../styles/globals/currentWeatherStyles";
import ForecastCard from "./ForecastCard";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentCityData } from "../../redux/asyncActions";
import SearchBar from "../SearchBar";
import { addToFavorites, removeFromFavorites } from "../../redux/actions";
import { PrimaryButton } from "../../styles/globals/buttonStyles";
import getWeatherStyle from "../../utils/functions/getWeatherIcon";
import BarLoader from "react-spinners/BarLoader";
import { ErrorMessage } from "../../styles/globals/errorStyles";
import { Helmet } from "react-helmet-async";
import { convertUnit } from "../../utils/functions/convertUnit";

export default function Home({ history }) {
  const { currentCity, fetch, favoriteCities, unit } = useSelector(
    (state) => state
  );
  const dispatch = useDispatch();
  const {
    currentWeather,
    name,
    ID,
    key,
    country,
    forecastWeather,
  } = currentCity;
  const favoriteCityObject = {
    name,
    ID,
    key,
    country,
    loading: true,
    error: false,
  };

  const weatherStyle = getWeatherStyle(currentWeather.WeatherIcon);
  const isFavorites = favoriteCities.some((city) => city.key === key);

  useEffect(() => {
    dispatch(getCurrentCityData(key));
  }, [key]);

  const favoritesClickHandler = (cityData, isInFavorites) => {
    if (isInFavorites) {
      dispatch(removeFromFavorites(cityData.key));
      localStorage.setItem(
        "favorites",
        JSON.stringify(
          favoriteCities.filter((city) => city.key !== cityData.key)
        )
      );
    } else {
      dispatch(addToFavorites(cityData));
      localStorage.setItem(
        "favorites",
        JSON.stringify([...favoriteCities, cityData])
      );
    }
  };

  return (
    <>
      <Helmet>
        <title>WeatherApp</title>
      </Helmet>

      <SearchBar history={history} />

      <CurrentMain>
        {fetch.loading ? (
          <BarLoader color="#f50057" width={150} />
        ) : !fetch.error ? (
          <>
            <CurrentHeader backgroundColor={weatherStyle.backgroundColor}>
              <CurrentCityText>
                {name} ({ID})
              </CurrentCityText>
              <CurrentCountryText>{country}</CurrentCountryText>

              <CurrentInfoFrame>
                <CurrentTemperature>
                  {currentWeather.Temperature &&
                    `${convertUnit(
                      unit,
                      currentWeather.Temperature.Metric.Value
                    )}`}
                </CurrentTemperature>

                <CurrentWeatherIcon color={weatherStyle.iconColor}>
                  <weatherStyle.Icon />
                </CurrentWeatherIcon>

                <PrimaryButton
                  disableElevation
                  variant={isFavorites ? "contained" : "outlined"}
                  outline={true}
                  primary={isFavorites ? true : false}
                  onClick={() =>
                    favoritesClickHandler(favoriteCityObject, isFavorites)
                  }
                >
                  {isFavorites ? "Favorite ❤" : "Add favorite"}
                </PrimaryButton>
              </CurrentInfoFrame>

              <CurrentForecast>{currentWeather.WeatherText}</CurrentForecast>
            </CurrentHeader>
            <ForecastFrame>
              {forecastWeather.map((day) => (
                <ForecastCard foreCastData={day} key={day.Date} />
              ))}
            </ForecastFrame>
          </>
        ) : (
          <ErrorMessage>Error! please try again later .</ErrorMessage>
        )}
      </CurrentMain>
    </>
  );
}
