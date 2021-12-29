module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 13,
    sourceType: 'module',
  },
  rules: {
    "no-undef": "off",
    "no-useless-concat": "off",
    "no-console": "off",
    "no-underscore-dangle": "off",
    "semi": ["error", "always"],
    "quotes": ["error", "double"]
  },
};
