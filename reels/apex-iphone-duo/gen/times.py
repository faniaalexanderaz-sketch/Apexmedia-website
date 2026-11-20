# named voice moments in seconds, measured on assets/audio/vo.mp3 (word starts from the transcript, phrase starts snapped to the ends of the silences).
# "Apple" is written "Eppol" in the text sent to the voice so that it is said the English way.
# Version 2: continuous delivery (3.3 words a second, no pause longer than 0.12 s). The reel loops: "E tutto questo, solo perché..." leads back into "Apple ha appena fatto uscire..."
T = dict(start=0.0, uniphone=1.46, sipiega=2.13, costa=2.97, prezzo=3.44, euro=4.84, scommetto=5.27, non=5.87, lhafatto=6.38, vendertelo=6.57,
         resta=7.22, perche=8.24, trucco=8.83, subendo=9.49, anchetu=9.88, puoi=10.42, vendere=11.16, dipiu=11.62,
         domanda=12.16, mille=13.29, telefono=14.64, tanti=15.28, tantissimi=15.88, promax=16.74, centocinq=17.95, annoscorso=19.19,
         adesso=20.53, glimetto=21.28, ilduo=22.36, quei=22.60, dicolpo=23.74, affare=24.64, settecento=25.82, inmeno=26.72,
         stesso=27.33, cambiato=28.47, accanto=29.71, sichiama=30.35, effetto=30.90, ancora=31.33, ilprimo=31.76, diventa=33.00, metro=33.76,
         perquesto=34.31, nondeve=35.10, devesolo=36.09, normale=37.57, resto=38.48, euna=39.48, ovunque=40.49, ristorante=40.98,
         bottiglia=41.71, trecento=42.33, serve=43.26, sessanta=44.28, abbonamenti=44.91, premium=46.16, medio=47.57,
         quindi=47.94, nonabbassare=49.48, mettigli=50.73, cara=52.09, nonserve=52.46, serveche=53.66, vedano=54.07,
         cta=54.67, scrivi=56.63, motion=56.99, etispiego=58.10, etutto=58.96, soloperche=59.90, END=60.80)
T['normale0'] = round(T['normale'] - 0.1, 2)   # the cut just before "normale"
