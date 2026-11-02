/* Build settings. The Google client id is public, not a secret.
   ageScope: which Google permission is used to read an age.
     "none"      (current) Google is not asked for any age. Rankings use the age group the player chooses in Zest,
                 and sign-in needs no sensitive Google permission, so there is no extra Google review.
     "agerange"  asks only for a coarse age range; not in Google's public scope list, so it may not work.
     "birthday"  asks for the birth date; the service keeps only the age band. Needs Google's sensitive-scope review.
   apiBase: the ranking and sync service. Production by default. On localhost only, ?api=<url> overrides it.
   aimUrl: where the Aim game page is served from (shown in an iframe on the Challenges tab). */
var ZCONFIG={googleClientId:"583294696691-v3ubuab9nhs218lqhsh12no04h38dvlr.apps.googleusercontent.com",ageScope:"none",apiBase:"https://zest-api.orangepulplabs.workers.dev",aimUrl:"/site/zest/index.html"};
