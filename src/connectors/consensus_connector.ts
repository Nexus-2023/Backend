export async function consensusDataApi(apiUrl: string): Promise<any> {
  try {
    const ApiResult = await fetch(apiUrl, {
      method: "GET",
    })

    if (!ApiResult.ok) {
      throw new Error(`Failed to fetch data. Status: ${ApiResult.status}`)
    }

    return await ApiResult.json()
  } catch (error) {
    console.error("Error fetching  API data:", error)
    throw error
  }
}
