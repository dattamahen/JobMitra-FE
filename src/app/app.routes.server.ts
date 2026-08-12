import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
	{
		path: '',
		renderMode: RenderMode.Prerender
	},
	{
		path: 'login',
		renderMode: RenderMode.Prerender
	},
	{
		path: 'dashboard/:page',
		renderMode: RenderMode.Server
	},
	{
		path: 'job-applications/:jobId',
		renderMode: RenderMode.Server
	},
	{
		path: '**',
		renderMode: RenderMode.Prerender
	}
];
