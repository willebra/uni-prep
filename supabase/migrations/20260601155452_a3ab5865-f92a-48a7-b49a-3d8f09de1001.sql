-- M3: Korjaa "Keskeiset tulokset" -osion notes-teksti
UPDATE materials
SET study = jsonb_set(
  study,
  '{sections,0,notes}',
  '"Kävely/hölkkä, jooga ja voimaharjoittelu olivat tehokkaimpia liikuntamuotoja masennuksen hoidossa verrokkiin verrattuna. Tutkimuksen mukaan liikuntaa voidaan harkita psykoterapian ja lääkityksen RINNALLE keskeisenä hoitomuotona (ei psykoterapiaan yhdistettynä). Kävelyn/hölkän g oli −0,62 verrattuna verrokkiin."'::jsonb
)
WHERE id = '5a83d171-a894-44f8-9ea6-6ab8b6fd1ea5';

-- M2: Korjaa "Hedgesin g" -osion notes-teksti (kielivirhe)
UPDATE materials
SET study = jsonb_set(
  study,
  '{sections,1,notes}',
  '"Käytännössä Cohenin d:n korjattu versio pieniin otoksiin; ero d:hen on minimaalinen paitsi aivan pienimmissä otoksissa."'::jsonb
)
WHERE id = '1d74181f-ba4a-46ff-9421-c4c5e2745022';

-- M4: Korjaa "Soveltaminen uusiin tilanteisiin" -osion toinen bullet
UPDATE materials
SET study = jsonb_set(
  study,
  '{sections,2,bullets,1}',
  '"Mitä suurempi mittausvirhe, sitä suurempi yliarvio (harha valitussa arvossa)"'::jsonb
)
WHERE id = 'd4b58527-c3e1-490d-9322-1fcbe9b6452e';