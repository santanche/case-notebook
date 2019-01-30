== Case 001 ==
![Forklift](images/case-forklift.png)
Man, 51 years old, present to an emergency department complaining of chest pain.
++ Start -> Level 1

== Level 1 (dialog) ==
:Nurse: Doctor, we have a man (51 years old) who entered the emergency department reporting chest pain. His vital signs are ABP: 144x92mmHG; HR: 78bpm; RR: 21rpm; Temp: 37oC; O2Sat: 98%.

:Doctor: Let’s go!

:Patient: Doctor, I am feeling chest pain since yesterday. The pain is continuous and is located just in the middle of my chest, worsening when I breathe and when I lay down on my bed. I suffer from arterial hypertension and smoke 20 cigarettes every day. My father had a “heart attack” at my age and I am very worried about it. 

:Doctor: I did a physical examination and the cardiac and pulmonary auscultation are normal; chest pain does not worse with palpation of the thorax; there is no jugular stasis nor lower limb edema.

Jacinto: What do you want to do?

++ Generate hypothesis (control) -> Generate hypothesis 1
++ More information (control) -> More information 1
++ Call the supervisor (control) -> Call the supervisor 1

== Generate hypothesis 1 ==
What is your main diagnostic hypothesis?
{?1 hypothesis:mesh}
++ Submit hypothesis -> Check hypothesis 1

== More information 1 (notice) ==
The patient never felt chest pain before. He exercises regularly and has lost weight in the last three months. He takes amlodipine and losartan regularly.

Two weeks ago, he had an auto-limited gastroenteritis episode. He denies recent travels and surgery .

== Call the supervisor 1 (notice) ==
Hi! I am glad that you called me. Chest pain is an important complaint at the emergency department and we have to exclude the fatal causes: myocardial infarction (MI), acute aortic dissection (AAD), pulmonary embolism PE), hypertensive pneumothorax (HP), and Boerhaave Syndrome (BS).

The best way to find out what is happening with your patient, my young padawan, is to gather as much information as possible through history taking and physical examination. We need to search for the signs and symptoms that can guide our clinical reasoning process by changing the pre-test probabilities of each disease.

Do you know the concept of Likelihood ratio (LR)? -> Likelihood Ratio

++ Clinical History Myocardial Infarction
++ Physical Examination Myocardial Infarction
++ Clinical History Aortic Dissection
++ Physical Examination Aortic Dissection
++ Pulmonary Embolism Wells Criteria

Hypertensive pneumothorax is more common in tall and thin young adults (primary pneumothorax) or in patients with chronic pulmonary diseases or chest trauma (secondary pneumothorax). On physical examination, we expect asymmetry in lung auscultation and the trachea may be dislocated to the contralateral side of the pneumothorax.

Boerhaave Syndrome is more common in patients who presented vomiting before the chest pain started, were submitted to endoscopic procedures or had chest trauma.

How does this information can help you to solve your case?

== Likelihood Ratio (notice) ==

Likelihood ratio (LR) - like sensitivity and specificity, LR describe the discriminatory power of features in a clinical context, estimating the probability of disease. When the LR is higher than 1, the feature increases the probability; when lower than 1, reduces it.

== Clinical History Myocardial Infarction (notice) ==
![Clinical History Myocardial Infarction](images/ebm-clinical-history-myocardial-infarction.png)

== Physical Examination Myocardial Infarction (notice) ==
![Physical Examination Myocardial Infarction](images/ebm-physical-examination-myocardial-infarction.png)

== Clinical History Aortic Dissection (notice) ==
![Clinical History Aortic Dissection](images/ebm-clinical-history-aortic-dissection.png)

== Physical Examination Aortic Dissection (notice) ==
![Physical Examination Aortic Dissection](images/ebm-physical-examination-aortic-dissection.png)

== Pulmonary Embolism Wells Criteria (notice) ==
![Pulmonary Embolism Wells Criteria](images/ebm-pulmonary-embolism-wells-criteria.png)

== Check hypothesis 1 (selector) ==
{{symptoms#contribution to diagnostics: ,+,=,-;lightgrey,green,blue,red
Among all patient features, signs, and symptoms highlighted on text, select all that increase the probability of your diagnostic hypothesis:

Nurse: Doctor, please you have to evaluate a {man(male)} ({51 years-old(aging=51)#=}) who entered the emergency department reporting {chest pain#=}.His vital signs are {ABP: 144x92mmHG#=}; {HR: 78bpm#=}; {RR: 21rpm#=}; {Temp: 37oC#=}; {O2Sat: 98%#=}.

Patient: Doctor, I am feeling chest pain since yesterday. The {pain is continuous#=} and {is located just in the middle of my chest#=}, {worsening when I breathe#+} and {when I lay down on my bed#+}. I have {arterial hypertension#-} and {I smoke 20 cigarettes(smoking=20/day)#-} every day. {My father had a "heart attack"#-} at my age and I am very worried about it.

You perform physical examination: {cardiac and pulmonary auscultation are normal#-}; {chest pain does not worse with palpation of the thorax#=}; {there is no jugular stasis#=} {nor lower limb edema#=}.
}}
++ Submit -> Order EKG 

== Order EKG ==
Our patient denies any recent long trip, immobilization or surgery.

The blood pressure is symmetric in the four limbs. 

Game: What do you want to do?
++ Generate hypothesis -> Generate hypothesis 2
++ Get more information -> More information 2
++ Call the supervisor -> Call the supervisor 2

EKG:

![EKG](images/ekg-original.png)

== Generate hypothesis 2 ==
What is your main diagnostic hypothesis?
{?1 hypothesis:mesh}
++ Submit hypothesis -> Check hypothesis 2

== More information 2 (notice) ==

EKG description
![EKG Description](images/ekg-description.png)

++ EKG Analysis

== EKG Analysis (notice) ==

Image zoom.

== Call the supervisor 2 (notice) ==
We did not find features that increase the likelihood of myocardial ischemia. Moreover, our patient has a pleuritic chest pain that gets worse when the patient lays down.

In the EKG we found ST-segment elevation in almost all leads. Also, we found a depression of the PR segment in the DII lead.

== Check hypothesis 2 ==
![EKG-A](images/ampliacao-eletro.gif)
++ Submit -> Final report

== Final report ==
# Feedback
Score: ...
Evaluation: ...
Two columns