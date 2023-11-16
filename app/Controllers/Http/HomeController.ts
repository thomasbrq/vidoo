import youtube from '@yimura/scraper'
const { translate } = require('bing-translate-api')

interface Video {
  title: string
  url: URL
}

// https://gist.github.com/Josantonius/b455e315bc7f790d14b136d61d9ae469
const state = {
  languages: [
    { language: 'English', code: 'en-EN', short: 'en' },
    { language: 'French', code: 'fr-FR', short: 'fr' },
    { language: 'Español', code: 'es-ES', short: 'es' },
  ],
}

async function translate_topic(topic: string, language: string): Promise<string | null> {
  const lang = state.languages.find((e: any) => e.code === language)

  if (!lang) {
    return null
  }

  const t = await translate(topic, null, lang.short)

  return t.translation
}

async function create_playlist(translated_topic: string, language: string): Promise<Video | null> {
  // @ts-ignore
  const yt = new youtube.default(language)

  const results = await yt.search(translated_topic, {
    language: language,
    searchType: 'video',
  })

  if (results.videos.length <= 0) {
    return null
  }

  const data = results.videos.map((e: any) => {
    return { title: e.title, url: e.link }
  })

  return data
}

export default class HomeController {
  public async index({ view }) {
    return view.render('home', state)
  }

  // {ctx, session, response}: {ctx: HttpContext}
  public async create({ request, response, session }) {
    const body = request.body()
    const language = body.language
    const topic = body.topic

    if (!language || !topic) {
      return response.redirect().back()
    }

    const translatedTopic = await translate_topic(topic, language)
    if (!translatedTopic) {
      return response.redirect().back()
    }

    const data = await create_playlist(translatedTopic, language)
    if (!data) {
      return response.redirect().back()
    }

    session.flash('videos', data)
    return response.redirect().back()
  }
}
