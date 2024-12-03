export function GET() {
  console.log('HelloWorld')

  return Response.json({
    code: 200,
    message: 'HelloWorld',
  })
}
