I'd definitely appreciate help on this project.
It's a bit of a mess and I'm only making it messier. "Just one more calculator" I keep telling myself.
I think I've finally built enough different things to get a grasp on _how_ things should be standardized.

If you're interested in contributing, shoot me an email with your ideas and intentions and we'll go from there.
Probably better than going off and writing some awesome code/calculator only for the ground to have shifted.

The export module will not work properly _on local files_ in many web browsers. This is because the export module pulls in all referenced js/css files on export, and this is not acceptable behavior for local files, apparently. https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp This shouldn't affect you if you're using this tool from a source on the web, or have exported it from there (as the exported page will no longer have any external dependencies that need pulled on re-export), but if you're developing and care about export behavior, you'll need to change your browser's settings.
