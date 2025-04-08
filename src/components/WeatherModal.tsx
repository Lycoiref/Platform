import { useState, useEffect } from 'react'

interface WeatherInfo {
  updateTime: Date
  windDir: string
  windSpeed: string
  area: string
  city: string
  icon: string
  temp: string
  weather: string
  bodyTemperature: string
  tempMax: string
  tempMin: string
  UVIndex: string
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

const getCurrentPosition = (): Promise<{ lon: number; lat: number }> => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lon: position.coords.longitude,
            lat: position.coords.latitude,
          })
        },
        (error) => {
          console.error('Error getting geolocation:', error)
          reject(error)
        }
      )
    } else {
      reject(new Error('Geolocation is not supported by this browser.'))
    }
  })
}

// 获取天气信息的函数
const getWeatherInfo = async (): Promise<WeatherInfo> => {
  let pos: { lon: number; lat: number }
  try {
    pos = await getCurrentPosition()
  } catch (error) {
    console.error('Using default position due to error:', error)
    pos = { lon: 120.16, lat: 30.25 } // 使用默认值
  }

  const res = await fetch(
    `${baseUrl}/api/weather?lon=${pos.lon}&lat=${pos.lat}`
  )
  if (!res.ok) {
    throw new Error('Failed to fetch weather data')
  }
  return res.json()
}

function changeToFormat(str: string) {
  if (str.length == 1) {
    return '0' + str
  }
  return str
}

function WeatherModal({ width, height }: { width: string; height: string }) {
  const [isLoading, setIsLoading] = useState(true)
  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formattedTime, setFormattedTime] = useState('')

  // 在组件挂载时获取天气信息
  useEffect(() => {
    getWeatherInfo()
      .then((data) => {
        console.log(data)
        setWeatherInfo(data)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching weather data:', error)
        setError('Failed to load weather data')
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    const date = new Date(weatherInfo?.updateTime as Date)
    setFormattedTime(
      changeToFormat(date.getHours().toString()) +
        ':' +
        changeToFormat(date.getMinutes().toString())
    )
  }, [weatherInfo?.updateTime])

  if (error) {
    return <div>{error}</div>
  }

  return (
    <>
      {isLoading ? (
        <div
          style={{ width: `${width}`, height: `${height}` }}
          className="flex items-center justify-center rounded-xl shadow-[0px_0px_4px_rgba(0,0,0,0.15)]"
        >
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-b-4 border-gray-300 border-b-gray-700"></div>
        </div>
      ) : error ? (
        <div
          style={{ width: `${width}`, height: `${height}` }}
          className="flex items-center justify-center rounded-xl shadow-[0px_0px_4px_rgba(0,0,0,0.15)]"
        >
          <div>Failed to load</div>
        </div>
      ) : (
        <div
          className="flex flex-col rounded-xl p-5 font-semibold shadow-[0px_0px_4px_rgba(0,0,0,0.15)]"
          style={{ width: `${width}`, height: `${height}` }}
        >
          <div className="flex h-[12.5%] justify-between text-[#4A5565]">
            <div className="flex gap-2">
              <div>{weatherInfo?.city}</div>
              <div
                style={{
                  display:
                    weatherInfo?.area === weatherInfo?.city ? 'none' : 'block',
                }}
              >
                {weatherInfo?.area}
              </div>
            </div>
            <div>
              {weatherInfo?.tempMax}°&nbsp;/&nbsp;{weatherInfo?.tempMin}°
            </div>
          </div>
          <div className="flex flex-1">
            <div className="flex flex-[1] items-center justify-center">
              <img
                src={`/weatherIcons/${weatherInfo?.icon}.svg`}
                alt="failed"
                width={60}
                height={60}
              />
            </div>
            <div className="flex flex-[2] items-center">
              <div className="flex h-[80%] w-full flex-col rounded-xl border-2 border-dashed border-[#D4D4D8]">
                <div className="flex h-3/5 items-center justify-around">
                  <div className="text-xl">{weatherInfo?.temp}°</div>
                  <div className="flex flex-col items-center justify-center text-xs font-medium text-[#9F9FA9]">
                    <div>上次更新</div>
                    <div>{formattedTime}</div>
                  </div>
                </div>
                <div className="flex h-2/5 justify-center text-sm font-medium text-[#9F9FA9]">
                  <div className="flex w-[90%] items-center justify-center gap-6 border-t-2 border-dashed border-[#D4D4D8]">
                    <div>体感温度</div>
                    <div>{weatherInfo?.bodyTemperature}°</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex h-[12.5%] justify-between font-medium text-[#4A5565]">
            <div>{weatherInfo?.weather}</div>
            <div>{weatherInfo?.windDir}</div>
            <div>风速&nbsp;{weatherInfo?.windSpeed}&nbsp;km/h</div>
            <div>uvIndex&nbsp;{weatherInfo?.UVIndex}</div>
          </div>
        </div>
      )}
    </>
  )
}

export default WeatherModal
