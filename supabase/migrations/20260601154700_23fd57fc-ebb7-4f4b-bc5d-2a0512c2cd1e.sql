UPDATE public.materials
SET study = jsonb_set(
  jsonb_set(
    study,
    '{sections,0,bullets}',
    '["Yksi otos: d = (x − m)/s", "Kaksi otosta: d = (x₂ − x₁)/s_p, missä s_p = √((s₁² + s₂²)/2)", "Pieni d ≈ 0,2; keskisuuri 0,5; suuri 0,8"]'::jsonb
  ),
  '{keyConcepts,1,definition}',
  '"d = (x₂ − x₁) / s_p, jossa s_p = √((s₁² + s₂²)/2) on yhdistetty keskihajonta"'::jsonb
)
WHERE title LIKE 'M2%';

UPDATE public.materials
SET questions = jsonb_set(
  jsonb_set(
    questions,
    '{2,prompt}',
    '"Kaksi yhtä suurta otosta: x₁ = 50, x₂ = 56, s₁ = 10, s₂ = 10. Laske Cohenin d kaavalla d = (x₂ − x₁)/s_p."'::jsonb
  ),
  '{2,explanation}',
  '"s_p = √((10² + 10²)/2) = √100 = 10. d = (56 − 50)/10 = 0,6."'::jsonb
)
WHERE title LIKE 'M2%';