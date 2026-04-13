(function () {
    function initRoiTool() {
        var page = document.querySelector(".roi-tool-page");
        if (!page || page.dataset.roiInitialized === "true") {
            return;
        }

        var form = page.querySelector("[data-roi-form]");
        if (!form) {
            return;
        }

        page.dataset.roiInitialized = "true";

        var outputs = {};
        page.querySelectorAll("[data-roi-output]").forEach(function (node) {
            outputs[node.getAttribute("data-roi-output")] = node;
        });

        var focusLibrary = {
            conversion: [
                {
                    title: "Homepage clarity",
                    body: "The site is asking visitors to do too much interpretation too early. The value, the audience, and the outcome should land in the first screen.",
                },
                {
                    title: "Proof near the CTA",
                    body: "The credibility is there, but it isn't sitting close enough to the claims and actions that need it most.",
                },
                {
                    title: "Path to inquiry",
                    body: "The route from interest to inquiry feels heavier than it should - less obvious, more effortful, more hesitant.",
                },
            ],
            quality: [
                {
                    title: "Offer fit",
                    body: "The site is generating interest, but not enough of it looks like the work you actually want more of.",
                },
                {
                    title: "Expectation setting",
                    body: "Scope, budget, and fit signals are soft, which lets low-intent inquiries through that shouldn't make it this far.",
                },
                {
                    title: "Post-inquiry follow-through",
                    body: "Value leaks after the form when response, process, or sales framing feels less considered than the site itself.",
                },
            ],
            visibility: [
                {
                    title: "Search visibility",
                    body: "Close behavior is healthy. The ceiling is getting more of the right visitors in the door - not conversion.",
                },
                {
                    title: "High-intent entry pages",
                    body: "The site needs more entry points mapped to the questions buyers ask before they're ready to reach out.",
                },
                {
                    title: "Distribution cadence",
                    body: "Content, referrals, search, and outbound aren't yet feeding the site steadily enough to move the number.",
                },
            ],
            highTicket: [
                {
                    title: "Trust at first glance",
                    body: "At this deal size, buyers need more certainty, more specificity, and less ambiguity before they inquire.",
                },
                {
                    title: "Proof where the risk sits",
                    body: "Case studies, outcomes, and process cues should do the heaviest work exactly where pricing anxiety is highest.",
                },
                {
                    title: "A consultative next step",
                    body: "The CTA should read like the start of a conversation, not a generic form submission.",
                },
            ],
            balanced: [
                {
                    title: "Message clarity",
                    body: "A sharper first-screen story tends to create lift before much else on the site changes.",
                },
                {
                    title: "Proof structure",
                    body: "Proof works best when it sits next to the claims it supports - not buried deeper in the site.",
                },
                {
                    title: "Path to contact",
                    body: "Even strong sites leak value when the next step feels slightly harder, vaguer, or higher-friction than it should.",
                },
            ],
        };

        function clamp(value, min, max) {
            return Math.min(Math.max(value, min), max);
        }

        function formatCount(value) {
            return new Intl.NumberFormat("en-US", {
                maximumFractionDigits: value >= 100 ? 0 : 1,
            }).format(value >= 100 ? Math.round(value) : Math.round(value * 10) / 10);
        }

        function formatMoney(value) {
            if (value >= 100000) {
                return new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    notation: "compact",
                    maximumFractionDigits: 1,
                }).format(value);
            }

            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
            }).format(Math.round(value));
        }

        function formatRate(value) {
            var rounded = Math.round(value * 10) / 10;
            return rounded.toFixed(1).replace(".0", "") + "%";
        }

        function scenarioRates(currentRate) {
            var additions;

            if (currentRate < 0.75) {
                additions = [0.45, 0.9, 1.35];
            } else if (currentRate < 1.5) {
                additions = [0.3, 0.65, 1];
            } else if (currentRate < 2.5) {
                additions = [0.2, 0.45, 0.75];
            } else {
                additions = [0.15, 0.3, 0.55];
            }

            return additions.map(function (addition) {
                return clamp(Math.round((currentRate + addition) * 10) / 10, 0, 6);
            });
        }

        function getInputs() {
            return {
                traffic: clamp(Number(form.traffic.value) || 0, 0, 1000000),
                conversionRate: clamp(Number(form.conversionRate.value) || 0, 0, 25),
                closeRate: clamp(Number(form.closeRate.value) || 0, 0, 100),
                projectValue: clamp(Number(form.projectValue.value) || 0, 0, 1000000),
                industry: form.industry.value || "other",
            };
        }

        function getIndustryNote(industry) {
            if (industry === "creative-studio") {
                return "Creative buyers read for fit, taste, and trust before they reach out - the site has to answer all three.";
            }

            if (industry === "manufacturing") {
                return "Technical buyers want proof around specialization, capability, and reliability - not softer positioning.";
            }

            if (industry === "healthcare") {
                return "In trust-sensitive categories, reassurance and credibility cues carry as much weight as the offer itself.";
            }

            if (industry === "real-estate") {
                return "In high-consideration categories, certainty and process visibility usually do more work than louder messaging.";
            }

            if (industry === "hospitality") {
                return "For experience-led brands, emotional clarity and a low-friction next step need to work together.";
            }

            return "In most service businesses, the strongest gains come from clearer positioning, stronger proof, and less friction to inquiry.";
        }

        function calculate(inputs) {
            var leadsNow = inputs.traffic * (inputs.conversionRate / 100);
            var closesNow = leadsNow * (inputs.closeRate / 100);
            var revenueNow = closesNow * inputs.projectValue;
            var rates = scenarioRates(inputs.conversionRate);
            var scenarios = rates.map(function (rate, index) {
                var leads = inputs.traffic * (rate / 100);
                var closes = leads * (inputs.closeRate / 100);
                var revenue = closes * inputs.projectValue;
                var deltaMonthly = Math.max(revenue - revenueNow, 0);

                return {
                    key: ["conservative", "realistic", "ambitious"][index],
                    rate: rate,
                    deltaAnnual: deltaMonthly * 12,
                };
            });

            return {
                inputs: inputs,
                leadsNow: leadsNow,
                closesNow: closesNow,
                revenueNow: revenueNow,
                leadLift: Math.max((inputs.traffic * (scenarios[1].rate / 100)) - leadsNow, 0),
                scenarios: scenarios,
            };
        }

        function insight(snapshot) {
            var traffic = snapshot.inputs.traffic;
            var conversionRate = snapshot.inputs.conversionRate;
            var closeRate = snapshot.inputs.closeRate;
            var projectValue = snapshot.inputs.projectValue;
            var realistic = snapshot.scenarios[1];
            var industryNote = getIndustryNote(snapshot.inputs.industry);
            var mode = "balanced";
            var interpretation = "";
            var nextStep = "";

            if (traffic >= 2500 && conversionRate < 1.1) {
                mode = "conversion";
                interpretation = "You have enough traffic for the site itself to matter more than another push for visits. A move to " + formatRate(realistic.rate) + " conversion unlocks meaningful upside without touching the traffic baseline. " + industryNote;
                nextStep = "Start with the first-screen story. Move proof closer to the claims it supports, and make the primary CTA easier to trust.";
            } else if (conversionRate >= 1.3 && closeRate < 15) {
                mode = "quality";
                interpretation = "The site is generating inquiries, but too little of that interest is turning into closed work. That usually points to lead quality, offer fit, or friction after the form. " + industryNote;
                nextStep = "Review how the site qualifies the work, frames the offer, and carries people into the next step - so better-fit leads are the ones that come through.";
            } else if (traffic < 1500 && closeRate >= 20) {
                mode = "visibility";
                interpretation = "Close behavior looks healthy, which suggests the ceiling is visibility, not conversion. The site still matters - but getting more of the right visitors in is the bigger lever right now. " + industryNote;
                nextStep = "Keep sharpening conversion, and pair it with a visibility plan built around high-intent pages, search coverage, and steadier distribution into the site.";
            } else if (projectValue >= 20000 && conversionRate < 1.5) {
                mode = "highTicket";
                interpretation = "At this deal size, even modest conversion gains create outsized revenue impact. The site needs to reduce uncertainty faster and make trust land earlier. " + industryNote;
                nextStep = "Strengthen authority around the first CTA, make the process feel clearer, and let the next step read as the start of a conversation - not a transaction.";
            } else {
                interpretation = "The opportunity looks meaningful, and it doesn't automatically point to a full rebuild. The strongest gains are likely to come from a clearer story, stronger proof, and an easier route to inquiry. " + industryNote;
                nextStep = "Treat this estimate as a starting point. Review the first-screen story, proof placement, and inquiry path - on both mobile and desktop.";
            }

            return {
                interpretation: interpretation,
                nextStep: nextStep,
                focusAreas: focusLibrary[mode],
            };
        }

        function write(key, value) {
            if (outputs[key]) {
                outputs[key].textContent = value;
            }
        }

        var hasTrackedStart = false;

        function trackCalculatorStart(event) {
            var target = event && event.target;
            if (hasTrackedStart || !target || !form.contains(target)) {
                return;
            }

            var value = String(target.value || "").trim();
            if (!value) {
                return;
            }

            hasTrackedStart = true;

            if (typeof window.duoPushEvent === "function") {
                window.duoPushEvent("roi_calculator_start", {
                    form_name: "website_roi_calculator",
                    tool_name: "website_roi_calculator",
                    page_path: window.location.pathname,
                });
            }
        }

        function render() {
            var snapshot = calculate(getInputs());
            var read = insight(snapshot);
            var realistic = snapshot.scenarios[1];

            write("annualOpportunity", formatMoney(realistic.deltaAnnual));
            write(
                "summaryLede",
                "A realistic move to " + formatRate(realistic.rate) + " conversion means roughly " + formatCount(snapshot.leadLift) + " more leads a month - and " + formatMoney(realistic.deltaAnnual) + " in annual upside."
            );
            write("leadsNow", formatCount(snapshot.leadsNow));
            write("closesNow", formatCount(snapshot.closesNow));
            write("revenueNow", formatMoney(snapshot.revenueNow));
            write("conservativeRate", formatRate(snapshot.scenarios[0].rate));
            write("realisticRate", formatRate(snapshot.scenarios[1].rate));
            write("ambitiousRate", formatRate(snapshot.scenarios[2].rate));
            write("conservativeDelta", "+" + formatMoney(snapshot.scenarios[0].deltaAnnual) + " / year");
            write("realisticDelta", "+" + formatMoney(snapshot.scenarios[1].deltaAnnual) + " / year");
            write("ambitiousDelta", "+" + formatMoney(snapshot.scenarios[2].deltaAnnual) + " / year");
            write("interpretation", read.interpretation);
            write("diagnosisInterpretation", read.interpretation);
            write("nextStep", read.nextStep);
            write("focusTitle1", read.focusAreas[0].title);
            write("focusTitle2", read.focusAreas[1].title);
            write("focusTitle3", read.focusAreas[2].title);
            write("focusCardTitle1", read.focusAreas[0].title);
            write("focusCardTitle2", read.focusAreas[1].title);
            write("focusCardTitle3", read.focusAreas[2].title);
            write("focusBody1", read.focusAreas[0].body);
            write("focusBody2", read.focusAreas[1].body);
            write("focusBody3", read.focusAreas[2].body);
        }

        form.addEventListener("input", trackCalculatorStart, true);
        form.addEventListener("change", trackCalculatorStart, true);
        form.addEventListener("input", render);
        form.addEventListener("change", render);
        render();
    }

    function initAuditScorecard() {
        var page = document.querySelector(".audit-scorecard-page");
        if (!page || page.dataset.auditInitialized === "true") {
            return;
        }

        var form = page.querySelector("[data-audit-form]");
        if (!form) {
            return;
        }

        page.dataset.auditInitialized = "true";

        var outputs = {};
        page.querySelectorAll("[data-audit-output]").forEach(function (node) {
            outputs[node.getAttribute("data-audit-output")] = node;
        });

        var categories = {
            clarity: {
                label: "Clarity",
                questions: ["clarityStory", "clarityOffer"],
                strengthHeadline: "Clarity is already doing useful work.",
                strengthSummary: "Visitors are getting to the point faster, which usually means less interpretation is happening before interest can build.",
                frictionHeadline: "Clarity is making the site work harder than it should.",
                frictionSummary: "When the story is too soft or too broad, visitors spend energy trying to decode the offer instead of moving toward it.",
                fixes: [
                    {
                        title: "Sharpen the first-screen story",
                        body: "Make the audience, offer, and value land faster so the first screen does less asking and more explaining.",
                    },
                    {
                        title: "Make the offer more specific",
                        body: "Clarify what kind of work the site is actually built to win so the right people recognize themselves sooner.",
                    },
                    {
                        title: "Reduce interpretive work",
                        body: "Use simpler language, clearer hierarchy, and fewer competing messages so the site feels easier to trust.",
                    },
                ],
            },
            trust: {
                label: "Trust",
                questions: ["trustProof", "trustSignals"],
                strengthHeadline: "Trust signals are helping reduce risk.",
                strengthSummary: "The site is doing a better job of making claims feel credible, which helps visitors stay in motion longer.",
                frictionHeadline: "Trust is lagging behind the claims the site is making.",
                frictionSummary: "If proof and credibility cues arrive too late or feel too general, hesitation tends to rise right where confidence should increase.",
                fixes: [
                    {
                        title: "Move proof closer to the risk",
                        body: "Put outcomes, examples, and credibility signals next to the claims and CTAs that need reinforcement most.",
                    },
                    {
                        title: "Show concrete evidence",
                        body: "Replace softer reassurance with specific outcomes, recognizable clients, or visible signs of expertise.",
                    },
                    {
                        title: "Reduce trust gaps earlier",
                        body: "Let visitors see how you work and why you are credible before the site asks them to take the next step.",
                    },
                ],
            },
            cta: {
                label: "CTA",
                questions: ["ctaClarity", "ctaFriction"],
                strengthHeadline: "The next step is reasonably well supported.",
                strengthSummary: "Visitors are less likely to get stuck when the CTA is clear, repeated at the right moments, and easy enough to follow through on.",
                frictionHeadline: "CTA structure is slowing momentum.",
                frictionSummary: "Even interested visitors hesitate when the next step feels vague, poorly timed, or heavier than it needs to be.",
                fixes: [
                    {
                        title: "Clarify the primary CTA",
                        body: "Make the main next step more obvious and more consistent so visitors are not guessing what to do next.",
                    },
                    {
                        title: "Reduce inquiry friction",
                        body: "Simplify the route into contact so curiosity does not drop off before the form is complete.",
                    },
                    {
                        title: "Repeat the next step more intentionally",
                        body: "Bring the CTA back where interest peaks instead of treating it like a one-time prompt.",
                    },
                ],
            },
            ux: {
                label: "Experience",
                questions: ["uxMobile", "uxHierarchy"],
                strengthHeadline: "The experience layer feels considered.",
                strengthSummary: "When pages are easy to scan and mobile holds up well, the rest of the story has a better chance of landing cleanly.",
                frictionHeadline: "The experience layer is creating avoidable friction.",
                frictionSummary: "Crowded layouts, uneven pacing, or weaker mobile execution quietly erode confidence even when the core offer is solid.",
                fixes: [
                    {
                        title: "Tighten mobile pacing",
                        body: "Prioritize cleaner spacing, stronger hierarchy, and fewer cluttered moments on smaller screens.",
                    },
                    {
                        title: "Improve page focus",
                        body: "Let each section do one job well instead of asking visitors to parse too many ideas at once.",
                    },
                    {
                        title: "Smooth the path through the page",
                        body: "A more controlled rhythm makes it easier for visitors to stay oriented and move toward contact with less hesitation.",
                    },
                ],
            },
        };

        function average(values) {
            return values.reduce(function (sum, value) {
                return sum + value;
            }, 0) / values.length;
        }

        function formatScore(value) {
            return String(Math.round(value));
        }

        function scoreBand(score) {
            if (score >= 85) {
                return "Strong foundation";
            }
            if (score >= 70) {
                return "Solid but uneven";
            }
            if (score >= 50) {
                return "Mixed performance";
            }
            return "Likely leaking demand";
        }

        function categoryTone(score) {
            if (score >= 80) {
                return "Working well";
            }
            if (score >= 60) {
                return "Some drag";
            }
            return "Needs attention";
        }

        function getInputs() {
            var answers = {};

            Object.keys(categories).forEach(function (categoryKey) {
                categories[categoryKey].questions.forEach(function (questionName) {
                    var checked = form.querySelector('input[name="' + questionName + '"]:checked');
                    answers[questionName] = checked ? Number(checked.value) : 2;
                });
            });

            return answers;
        }

        function calculate(answers) {
            var categoryScores = {};

            Object.keys(categories).forEach(function (categoryKey) {
                var values = categories[categoryKey].questions.map(function (questionName) {
                    return answers[questionName];
                });
                categoryScores[categoryKey] = Math.round(((average(values) - 1) / 2) * 100);
            });

            var ranked = Object.keys(categoryScores).map(function (key) {
                return {
                    key: key,
                    label: categories[key].label,
                    score: categoryScores[key],
                };
            }).sort(function (a, b) {
                return b.score - a.score;
            });

            return {
                overallScore: Math.round(average(ranked.map(function (item) {
                    return item.score;
                }))),
                categoryScores: categoryScores,
                strongest: ranked[0],
                weakest: ranked[ranked.length - 1],
                rankedWeakness: ranked.slice().reverse(),
            };
        }

        function buildDiagnosis(snapshot) {
            var overallScore = snapshot.overallScore;
            var strongestArea = categories[snapshot.strongest.key];
            var weakestArea = categories[snapshot.weakest.key];
            var priorityAreas = snapshot.rankedWeakness.slice(0, 3).map(function (item) {
                return categories[item.key];
            });
            var diagnosisHeadline = "";
            var diagnosisSummary = "";
            var nextHeadline = "";
            var nextSummary = "";

            if (overallScore >= 85) {
                diagnosisHeadline = "The site has a strong foundation and likely needs refinement more than rescue.";
                diagnosisSummary = "The pattern suggests the basics are already working. The remaining lift probably comes from tightening the weakest area instead of overhauling everything at once.";
                nextHeadline = "Keep the strongest habits and pressure-test the weakest category.";
                nextSummary = "Start with the one area that still feels soft, then improve it in a way that supports the rest of the journey instead of adding more complexity.";
            } else if (overallScore >= 70) {
                diagnosisHeadline = "The site looks capable, but the weak spots are still costing momentum.";
                diagnosisSummary = "This is where a site feels respectable on the surface but still leaves too much value on the table. The right move is strengthening the weakest moments where confidence or motion breaks down.";
                nextHeadline = "Tighten the weakest category before adding more traffic or content.";
                nextSummary = "You will usually get more lift from fixing the soft spots in clarity, proof, CTA structure, or experience than from simply asking more people to see the same pages.";
            } else if (overallScore >= 50) {
                diagnosisHeadline = "The site is carrying a mix of strengths and noticeable drag.";
                diagnosisSummary = "Some parts of the experience are helping, but others are making the site work harder than it should. Visitors are interested enough to keep going, but not convinced enough to act with confidence.";
                nextHeadline = "Reduce the friction before trying to amplify the site.";
                nextSummary = "Start where hesitation is most likely to show up. Tightening one weak layer well often improves the way the rest of the site is perceived too.";
            } else {
                diagnosisHeadline = "The site is likely leaking demand in more than one important place.";
                diagnosisSummary = "At this score, the issue is usually not one isolated miss. It is the combined effect of a softer story, weaker proof, less decisive CTA structure, or a rougher user experience.";
                nextHeadline = "Start with the most consequential weak spot and rebuild confidence from there.";
                nextSummary = "Make the first move the one that reduces the most uncertainty fastest. Once that improves, the rest of the site becomes easier to diagnose with more accuracy.";
            }

            return {
                overallLabel: scoreBand(overallScore) + " - strongest in " + snapshot.strongest.label.toLowerCase() + ", weakest in " + snapshot.weakest.label.toLowerCase() + ".",
                diagnosisHeadline: diagnosisHeadline,
                diagnosisSummary: diagnosisSummary,
                strengthHeadline: strongestArea.strengthHeadline,
                strengthSummary: strongestArea.strengthSummary,
                frictionHeadline: weakestArea.frictionHeadline,
                frictionSummary: weakestArea.frictionSummary,
                nextHeadline: nextHeadline,
                nextSummary: nextSummary,
                priorityFixes: priorityAreas.map(function (area) {
                    return area.fixes[0];
                }),
            };
        }

        function render() {
            var snapshot = calculate(getInputs());
            var diagnosis = buildDiagnosis(snapshot);

            outputs.overallScore.textContent = formatScore(snapshot.overallScore);
            outputs.overallLabel.textContent = diagnosis.overallLabel;

            outputs.clarityScore.textContent = formatScore(snapshot.categoryScores.clarity);
            outputs.trustScore.textContent = formatScore(snapshot.categoryScores.trust);
            outputs.ctaScore.textContent = formatScore(snapshot.categoryScores.cta);
            outputs.uxScore.textContent = formatScore(snapshot.categoryScores.ux);

            outputs.clarityLabel.textContent = categoryTone(snapshot.categoryScores.clarity);
            outputs.trustLabel.textContent = categoryTone(snapshot.categoryScores.trust);
            outputs.ctaLabel.textContent = categoryTone(snapshot.categoryScores.cta);
            outputs.uxLabel.textContent = categoryTone(snapshot.categoryScores.ux);

            outputs.priorityTitle1.textContent = diagnosis.priorityFixes[0].title;
            outputs.priorityBody1.textContent = diagnosis.priorityFixes[0].body;
            outputs.priorityTitle2.textContent = diagnosis.priorityFixes[1].title;
            outputs.priorityBody2.textContent = diagnosis.priorityFixes[1].body;
            outputs.priorityTitle3.textContent = diagnosis.priorityFixes[2].title;
            outputs.priorityBody3.textContent = diagnosis.priorityFixes[2].body;

            outputs.diagnosisHeadline.textContent = diagnosis.diagnosisHeadline;
            outputs.diagnosisSummary.textContent = diagnosis.diagnosisSummary;
            outputs.strengthHeadline.textContent = diagnosis.strengthHeadline;
            outputs.strengthSummary.textContent = diagnosis.strengthSummary;
            outputs.frictionHeadline.textContent = diagnosis.frictionHeadline;
            outputs.frictionSummary.textContent = diagnosis.frictionSummary;
            outputs.nextHeadline.textContent = diagnosis.nextHeadline;
            outputs.nextSummary.textContent = diagnosis.nextSummary;
        }

        form.addEventListener("input", render);
        form.addEventListener("change", render);
        render();
    }

    function initToolsPages() {
        initRoiTool();
        initAuditScorecard();
    }

    window.initRoiTool = initRoiTool;
    window.initAuditScorecard = initAuditScorecard;
    window.initToolsPages = initToolsPages;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initToolsPages);
    } else {
        initToolsPages();
    }
})();
