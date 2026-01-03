const Koa = require('koa');
const KoaRouter = require('@koa/router');
const { bodyParser } = require('@koa/bodyparser');
const buildTheme = require('./build-theme');
const path = require('path');

const PORT = 8086;

const corsMiddleware = async function(ctx, next) {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', '*');
  ctx.set('Access-Control-Allow-Headers', '*');
  ctx.set('Access-Control-Allow-Credentials', 'true');
  ctx.set('Access-Control-Expose-Headers', 'content-disposition');

  if (ctx.method === 'OPTIONS') {
    ctx.body = '';
    ctx.status = 204;

    return;
  }

  return await next();
};

const app = new Koa();
const router = new KoaRouter({
  prefix: '/api'
});

// APP.
app.use(corsMiddleware);

router.get('/get-theme-variables', async function(ctx) {
  const vars = await buildTheme.exportConstructiveVars();
  const result = {};

  // '$--alert-border-radius'
  for (const key of Object.keys(vars.global)) {
    const value = vars.global[key];
    const shortKey = key.slice(3);

    let group = 'others';
    if (/\bcolor\b/.test(shortKey)) {
      group = 'color';
    } else if (/\bfont\b/.test(shortKey)) {
      group = 'typography';
    } else if (/\bborder\b/.test(shortKey)) {
      group = 'border';
    }

    let type = 'others';
    if (/\bcolor\b/.test(shortKey)) {
      type = 'color';
    } else if (/\bfont-weight\b/.test(shortKey)) {
      type = 'fontWeight';
    } else if (/\bfont-size\b/.test(shortKey)) {
      type = 'fontSize';
    } else if (/\bfont-line-height\b/.test(shortKey)) {
      type = 'fontLineHeight';
    } else if (/\bborder-radius\b/.test(shortKey)) {
      type = 'borderRadius';
    } else if (/\bborder-shadow\b/.test(shortKey)) {
      type = 'boxShadow';
    }

    let groupResult = result[group];
    if (!groupResult) {
      result[group] = groupResult = {
        name: group,
        config: []
      };
    }

    groupResult.config.push({
      key,
      value: value.value,
      type
    });
  }

  ctx.body = Object.values(result);
});

router.post('/update-theme-variables', bodyParser(), async function(ctx, next) {
  // {"global":{"$--color-primary":"#1976A1","$--color-warning":"#FF6A00","$--color-danger":"#E1140B","$--color-success":"#498631","$--color-text-placeholder":"#757575","$--color-text-primary":"#333333"},"local":{},"download":true}
  const body = ctx.request.body;
  const themeName = ctx.query.name;

  if (body != null) {
    await buildTheme.run(themeName, Object.assign({ global: {}, local: {} }, body));
  }

  if (body.download === true) {
    const result = await buildTheme.getThemeBuiltZipFile(themeName);
    ctx.attachment(result.filename);
    ctx.body = result.handler;

    return;
  }

  const result = await buildTheme.getThemeBuiltFile(themeName);
  ctx.type = path.extname(result.filename).slice(1);
  ctx.body = result.handler;
});

app.use(router.allowedMethods());
app.use(router.routes());

app.listen(PORT, '0.0.0.0', () => {
  console.log('Theme chalk server ready on port:', PORT);
});
