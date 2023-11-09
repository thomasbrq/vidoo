// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { HttpContext } from "@adonisjs/core/build/standalone"
import { SessionContract } from "@ioc:Adonis/Addons/Session";
import youtube from '@yimura/scraper'

const state = {
	languages: [
		{ language: "English", code: "en-EN" },
		{ language: "French", code: "fr-FR" },
		{ language: "Español", code: "es-ES" },
	]
}

export default class HomeController {
	public async index({ view }) {
		return view.render('home', state)
	}

	// {ctx, session, response}: {ctx: HttpContext}
	public async create({ request, response, session }) {
		const body = request.body()
		const language = body.language;
		const topic = body.topic;

		if (!language || !topic) {
			return response.redirect().back()
		}

		const yt = new youtube.default(language);

		// Sets the language communicated to YouTube to Dutch from Belgium for this search
		const results = await yt.search(topic, {
			language: language,
			searchType: 'video' // video is the default search type
		});

		if (results.videos.length <= 0) {
			return response.redirect().back()
		}

		const data = results.videos.map((e: any) => {
			return { title: e.title, url: e.link  };
		} )

		session.flash('videos', data)
		return response.redirect().back()
	}
}
