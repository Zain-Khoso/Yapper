async function serverError(error, _, res, __) {
  console.log('\n', error, '\n');

  res.status(500).json({
    data: {},
    errors: {
      root: 'Something went wrong.',
    },
  });
}

export { serverError };
