export async function getCoordinates(
  place: string
) {
  const token =
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      place
    )}.json?access_token=${token}`
  );

  const data = await response.json();

  if (!data.features?.length) {
    return null;
  }

  const [lng, lat] =
    data.features[0].center;

  return {
    lat,
    lng,
  };
}