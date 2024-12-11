export function GET() {
  console.log('HelloWorld')

  return new Response(
    JSON.stringify({
      code: 200,
      message: 'HelloWorld',
    })
  )
}
