// Guide modules share one content source for visible FAQs and structured data.
// Project claims are grounded in the linked, published Duo case studies.
const projects = {
    mgny: {
        name: "MGNY", href: "/work/mgny/", width: 1024, height: 693,
        image: "/assets/work/mgny/mgny__banner@1024.webp",
        alt: "Duo's MGNY identity with an illustrated New York skyline",
        scope: "Brand strategy · Digital identity · Website · Illustration",
        body: "For this New York real-estate consulting company, brand strategy, custom illustration, and website design work together to explain a complex service offering."
    },
    genimex: {
        name: "Genimex Group", href: "/work/genimexgroup/", width: 1024, height: 774,
        image: "/assets/work/genimexgroup/genimexgroup__sec-4--1--guide.webp",
        alt: "Genimex manufacturing services website displayed on a laptop",
        scope: "Site architecture · Digital identity · Website",
        body: "We organized manufacturing services, clients, and case studies into one connected website. A modular Sanity CMS lets the team compose pages and update content and SEO details."
    },
    africa: {
        name: "Africa Dream Safaris", href: "/work/africadreamsafaris/", width: 1024, height: 639,
        image: "/assets/work/africadreamsafaris/africadreamsafaris__sec-5--1--guide.webp",
        alt: "Africa Dream Safaris website showing traveler reviews and safari photography",
        scope: "Site architecture · Digital storytelling · WordPress",
        body: "Regions, lodges, wildlife, and planning advice needed a clear structure. We designed reusable modules and a centralized WordPress content library alongside the inquiry experience."
    },
    lumina: {
        name: "Lumina Studio Theatre", href: "/work/lumina/", width: 1024, height: 693,
        image: "/assets/work/lumina/lumina__banner@1024.webp",
        alt: "Lumina Studio Theatre website and visual identity by Duo",
        scope: "Digital identity · Website · Custom icons",
        body: "The theatre's playful character carries through its visual identity and website, with custom icons and layouts for performances, events, and its wider story."
    }
};

const links = {
    cost: { href: "/guides/website-redesign-cost/", label: "What shapes the cost of a website redesign" },
    choose: { href: "/guides/choose-web-design-agency/", label: "How to choose a web design agency" },
    web: { href: "/guides/baltimore-web-design/", label: "Finding a web design partner in Baltimore" },
    brand: { href: "/guides/baltimore-branding-agency/", label: "Branding with Duo Studio" }
};

const guides = {
    "website-redesign-cost": {
        topic: "Planning a website",
        intro: "A useful website budget starts with what needs to change. Here's how to separate the essentials from the extras—and compare proposals that cover the same work.",
        contents: [{ id: "quick-answer", label: "Budget" }, { id: "what-drives-cost", label: "Scope" }, { id: "our-work", label: "In practice" }, { id: "your-brief", label: "Your brief" }],
        answer: {
            title: "How much should you budget?",
            body: "For a custom Duo website, $20,000–$30,000 is an initial planning range, not a fixed quote. The actual investment depends on the design, content, CMS, and functionality involved. Brand strategy or identity work, substantial new content, and complex integrations need to be scoped explicitly."
        },
        sections: [
            { type: "rows", id: "what-drives-cost", label: "01 / Scope", title: "Count the decisions, not just the pages.",
                intro: "Twenty pages built from a few repeatable layouts can be simpler than five pages with very different jobs. A good estimate makes those differences visible.",
                items: [
                    { title: "Brand and messaging", body: "Can the website build on an identity and story that already work? Or do positioning, messaging, and visual direction need attention first? A website redesign and a full rebrand are different scopes." },
                    { title: "Content and structure", body: "Copywriting, photography, content migration, and deciding what to keep all take work. Agree on who supplies each asset, who edits it, and how much existing content needs to move." },
                    { title: "Design and reusable modules", body: "A service page, project story, and resource library may need different structures. Designing a flexible set of modules gives those pages room to vary without treating every future update as a new build." },
                    { title: "CMS and functionality", body: "Forms, filtering, multilingual content, and external integrations each add requirements. Choose the platform around what visitors and editors need; a headless build is not automatically the right answer." },
                    { title: "Launch and ongoing care", body: "Redirects, accessibility checks, device testing, content entry, and editor handoff should be clear in the proposal. Hosting, licenses, maintenance, and future improvements may be separate ongoing costs." }
                ] },
            { type: "proof", id: "our-work", title: "Two websites. Different kinds of complexity.", projects: [projects.genimex, projects.africa] },
            { type: "rows", id: "compare-proposals", label: "02 / The proposal", title: "Compare the work behind the number.",
                items: [
                    { title: "Check what's included", body: "Look for named deliverables: discovery, sitemap, copy, design, development, migration, QA, training, and launch. An excluded workstream still needs an owner and a budget." },
                    { title: "Make feedback and timing explicit", body: "Ask how many review rounds are included, what your team needs to provide, and how changes are priced. A launch date depends on approvals and content as well as production time." },
                    { title: "Phase around a useful first launch", body: "If the budget is tight, prioritize the pages and functionality that help your audience understand the business and take the next step. A later phase can add depth without compromising the foundation." }
                ], link: links.choose },
            { type: "checklist", id: "your-brief", label: "03 / Before you enquire", title: "Bring these to the first conversation.",
                items: ["Your current website and what no longer works for the business.", "The audiences you need to reach and the actions the site should support.", "The content, identity, and photography you already have—and what is missing.", "Any essential integrations, editor needs, and reasons for a fixed launch date.", "A comfortable investment range, including what you may want to phase."],
                note: "You don't need a finished technical brief. This is enough to start a useful scope discussion." }
        ],
        faqs: [
            { question: "Is the $20,000–$30,000 range a package price?", answer: "No. It is a planning range for custom website work at Duo. We confirm the investment after discussing the scope, content responsibilities, functionality, and timeline. Combined brand and website work is scoped separately." },
            { question: "Can we keep our current brand?", answer: "Yes. If your identity and positioning still fit, the project can focus on website structure, content, design, and development. We can also identify specific brand gaps without assuming that everything needs to be replaced." },
            { question: "Does a new website include ongoing SEO?", answer: "A website scope can include technical foundations such as page metadata, redirects, and crawlable content. Ongoing search strategy, content production, and reporting are separate workstreams; a redesign does not guarantee traffic or leads." },
            { question: "Will a headless CMS cost less to run?", answer: "Not necessarily. Compare hosting, platform fees, maintenance, integrations, and the team's editing needs. We use custom WordPress or a headless approach where it fits the project, rather than treating either as the default answer." }
        ],
        cta: { title: "Let's put a useful scope around it.", body: "Tell us what your current site is missing, what needs to change, and the budget you have in mind. We'll help clarify whether a focused update or a fuller redesign makes sense.", label: "Discuss your website" },
        related: [links.choose, links.web]
    },
    "choose-web-design-agency": {
        topic: "Choosing a partner",
        intro: "A portfolio shows you what a studio made. Ask why they made it that way. The answer tells you far more about what you might make together.",
        contents: [{ id: "quick-answer", label: "Start here" }, { id: "what-to-look-for", label: "Taste and judgment" }, { id: "our-work", label: "A closer look" }, { id: "first-call", label: "First conversation" }],
        answer: { title: "Choose a point of view you can work with.", body: "Choose a web design agency whose work draws you in and whose reasoning earns your trust. Ask the team to walk through a live project: what they noticed, what they changed, and how those choices serve the people using it. Then check the practical fit—scope, budget, content, technology, and the working relationship. You're choosing both an eye and a way of working." },
        sections: [
            { type: "rows", id: "what-to-look-for", label: "01 / Your shortlist", title: "Start with what catches your eye.",
                intro: "Think of a theatre poster that makes you look twice. The lettering, the image, the space between them: you get a sense of the production before you've read the details. Websites can do that too. The first few moments tell you whether a place feels intimate, a business feels precise, or an organization has a sense of humor. It's worth noticing your own reaction before opening the comparison spreadsheet.",
                items: [
                    { title: "Give the attraction a name.", body: "Pick two or three projects you keep returning to. What holds your attention? Maybe the photography leaves room for the place to speak. Maybe the type has an awkwardness that feels exactly right. Maybe a complicated service suddenly makes sense. You don't need design vocabulary to have a useful opinion. Bring the detail, not just the word 'modern'." },
                    { title: "Look for a curious eye.", body: "A studio's references, writing, and side projects can show you what it pays attention to beyond a brief. Look for more than shared favorites. Can the team explain what interests them about a book cover, a title sequence, or an ordinary sign? That curiosity matters when your project needs an idea that won't come from looking only at your competitors." },
                    { title: "Ask what belongs to the client.", body: "You can admire a studio's taste without wanting your site to look like its own. Look across the work: what changes from one organization to the next? What feels specific to each one? We think a studio's point of view is most useful when it helps reveal a client's character. Ask how the team would learn yours before proposing a direction." }
                ] },
            { type: "proof", id: "our-work", title: "A floating chair can tell you quite a lot.", projects: [{
                ...projects.lumina,
                image: "/assets/work/lumina/lumina__sec-5--2@954.webp", width: 954, height: 636,
                alt: "Lumina's custom icon set, including floating chairs for seating policies and boxed brains for scholarships",
                scope: "Lumina Studio Theatre · Custom icons alongside a digital identity and website",
                body: "For Lumina Studio Theatre, we paired a rosy palette and playful serifs with a custom icon set: floating chairs for seating policies, boxed brains for scholarships. Even the practical information gets to carry some of the theatre's imagination. That's the kind of detail worth discussing with a potential partner. Why this image? Why here? Does the character carry through when someone needs to book, donate, or find a policy? A case study becomes much more useful when you can connect an expressive choice to its job."
            }] },
            { type: "rows", id: "try-the-website", label: "02 / The experience", title: "Now put the website to work.",
                intro: "The screenshot is an introduction. Open the site on your phone and give yourself something to do: find a performance, understand a service, send an inquiry. Notice where the design helps you along and where you have to stop and work it out.",
                items: [
                    { title: "Follow the detail past the homepage.", body: "Read a longer page. Open the menu. Try the keyboard. Does the type still feel considered when there is more to say? Is motion comfortable, and is the next step easy to find? These are useful first impressions, not a substitute for accessibility testing. Ask the studio what it tested, which parts it delivered, and what the client has changed since launch." },
                    { title: "Ask for a look behind the page.", body: "Your team will spend time in the CMS after the opening-day excitement has passed. Ask to see an ordinary edit: adding a project, changing an image, or building a page from modules. A custom website can use reusable parts. The interesting question is whether those parts give you useful freedom while keeping the site's character intact." }
                ] },
            { type: "checklist", id: "first-call", label: "03 / First conversation", title: "Questions that get past the pitch.",
                intro: "Bring a site you like, a specific reason you like it, and something about your own business that's difficult to explain. See where the conversation goes. You want to hear how the team thinks, but also whether it listens.",
                items: ["Walk us through a decision in this project. What made this direction right for that client?", "What would you need to understand about us before recommending an approach?", "Who would we work with, and how do you handle disagreement about a direction?", "Who is responsible for writing, photography, content entry, and approvals?", "Can you show us how our team would update the site?", "What does the fee include, what will we own, and what happens after launch?"],
                note: "Compare the written proposals as well as the conversations. Content, revision rounds, testing, handoff, and optional support should be explicit. Two appealing presentations can describe very different amounts of work." },
            { type: "rows", id: "where-duo-fits", label: "04 / Making the choice", title: "Leave room to be surprised.",
                intro: "The right studio may show you something you wouldn't have asked for. That's part of the value. The recommendation should still make sense once you've talked it through: the audience it serves, the story it tells, the constraints it respects.",
                items: [
                    { title: "Choose a conversation you want to continue.", body: "By the end of the selection process, you should have a feel for more than the likely deliverables. You should know what this team notices, how it explains a choice, and how it responds when you see things differently. Keep the practical checks. Make room for that judgment too." }
                ] }
        ],
        faqs: [
            { question: "Should we only consider agencies in our industry?", answer: "Industry knowledge can help, but it is not the only sign of fit. Ask for work with similar audiences, content needs, buying journeys, or technical requirements. The team should be able to explain how that experience applies to your business." },
            { question: "Should we hire locally?", answer: "Choose locally if in-person collaboration is important to your team, and confirm which meetings will actually happen in person. A remote team can also work well when communication, decision-making, and availability are clear." },
            { question: "How should we compare proposals?", answer: "Compare deliverables, responsibilities, revision rounds, platform requirements, ownership, and post-launch support. Then compare price and timing against that shared scope. A lower total may cover a different amount of work." },
            { question: "Do we need a new brand before a new website?", answer: "Not always. A strong existing identity can guide the redesign. If the positioning, message, or visual identity no longer fits the business, discuss that early so the website is built on an agreed direction." }
        ],
        cta: { title: "What caught your eye?", body: "If something in Duo's work stayed with you, we'd like to hear what it was—and what you're thinking about next.", label: "Start a conversation" },
        related: [links.cost, links.brand]
    },
    "baltimore-web-design": {
        topic: "Web design / Baltimore",
        intro: "A local address can make collaboration easier. The more important question is whether the team can turn your business story into a clear, distinctive, useful website.",
        contents: [{ id: "quick-answer", label: "The essentials" }, { id: "where-duo-fits", label: "Duo's approach" }, { id: "our-work", label: "Our work" }, { id: "your-brief", label: "Getting started" }],
        answer: { title: "What should you look for in a Baltimore web design agency?", body: "Look for a team that connects content, user experience, visual design, and development. Ask to see relevant live websites, understand who will do the work, and get clear on what your team will need to contribute. Local access is useful when it supports that working relationship—not as a substitute for it." },
        sections: [
            { type: "rows", id: "where-duo-fits", label: "01 / Working with Duo", title: "A website that reflects where you're going.",
                intro: "We're Duo Studio, a Baltimore-based design studio working with teams locally and across the country. We design brand identities and custom marketing websites for businesses and organizations ready to present themselves more clearly.",
                items: [
                    { title: "Start with the story and structure", body: "We look at what the business needs to communicate, who the site is for, and what visitors need to do. That informs the sitemap and page structure before the visual design takes shape." },
                    { title: "Design a connected experience", body: "Typography, imagery, movement, and page layouts should feel like parts of the same brand. We connect those decisions to the content, from the first introduction to service pages, project stories, and inquiry forms." },
                    { title: "Build around real editing needs", body: "Reusable modules and structured content help a site grow without losing consistency. Custom WordPress and headless setups such as Next.js with Sanity can both be useful; the right choice depends on the project." },
                    { title: "Make the handoff part of the scope", body: "Agree on content entry, testing, redirects, editor guidance, hosting, and ongoing support before launch. A website needs to work for the team maintaining it as well as the people visiting it." }
                ], link: { href: "/services/web-design-development/", label: "Our web design and development services" } },
            { type: "proof", id: "our-work", title: "Different organizations. The same care for the details.", projects: [projects.lumina, projects.genimex] },
            { type: "rows", id: "local-collaboration", label: "02 / Working together", title: "Local or remote, make the process clear.",
                items: [
                    { title: "Agree on how decisions get made", body: "Identify the people giving input and the person approving the work. Set a review rhythm that fits your team, and discuss any in-person sessions you need before the project starts." },
                    { title: "Share the constraints early", body: "A board presentation, funding deadline, campaign, or internal launch may shape the schedule. So will available content, stakeholder feedback, and integrations. A useful plan accounts for both." },
                    { title: "Separate launch work from ongoing marketing", body: "A website can provide a clearer offer and better paths to inquiry. Ongoing search, campaigns, and content publishing need their own owners and plans. No website partner can promise qualified leads from design alone." }
                ], link: links.cost },
            { type: "checklist", id: "your-brief", label: "03 / Getting started", title: "You can begin with a few clear answers.",
                items: ["What has changed in your organization since the current site was built?", "Who needs to understand your work, and what are they looking for?", "What should be easier for visitors and your internal team?", "What content and brand assets can we build on?", "What budget, timeline, and collaboration needs should shape the scope?"] }
        ],
        faqs: [
            { question: "Is Duo Studio based in Baltimore?", answer: "Yes. Duo is a Baltimore-based design studio. We work with local teams and clients elsewhere in the United States, with the collaboration approach agreed to fit the project." },
            { question: "Do you design and develop the website?", answer: "Yes. Duo's website work brings design and development together, including page structure, custom interfaces, and CMS implementation. The proposal defines the exact deliverables, content responsibilities, and handoff." },
            { question: "Can you work with our existing identity?", answer: "Yes. We can build on an existing brand when it supports your goals. If there are gaps in the identity or messaging, we can discuss a focused update or a broader brand scope before the website work begins." },
            { question: "Do you only work with Baltimore businesses?", answer: "No. Our work includes organizations in Baltimore and beyond, across areas such as manufacturing, real estate, arts, and travel. Location is one part of fit; the goals, scope, and working relationship matter too." }
        ],
        cta: { title: "Your business has moved forward. Has your website?", body: "Tell us where the site falls short and what your team needs next. We'll talk through the scope and where Duo can help.", label: "Talk about your website" },
        related: [links.choose, links.brand]
    },
    "baltimore-branding-agency": {
        topic: "Branding / Baltimore",
        intro: "When the business changes, the brand needs to keep up. We help connect what you stand for with how you look, what you say, and how people experience you online.",
        contents: [{ id: "quick-answer", label: "When to rebrand" }, { id: "what-we-do", label: "What we do" }, { id: "our-work", label: "Our work" }, { id: "your-brief", label: "Your starting point" }],
        answer: { title: "When does a business need a branding partner?", body: "When the gap is bigger than a logo. You may have a new audience, a broader offer, or a stronger business than your current identity suggests. A branding engagement can clarify the story and create a visual system that carries through your website and the materials your team uses." },
        sections: [
            { type: "rows", id: "what-we-do", label: "01 / Brand and web", title: "A clear idea, carried through.",
                intro: "Duo is a Baltimore-based design studio founded in 2020. We bring brand thinking, design, and development together, so the website is part of the brand's expression—not a separate exercise at the end.",
                items: [
                    { title: "Strategy and positioning", body: "We work to understand your audience, offering, and competitive context. The aim is a clear point of view on what makes the business worth choosing, with an agreed direction for the creative work." },
                    { title: "Messaging and visual identity", body: "The way a brand sounds and looks should support the same story. Depending on the scope, that can include messaging, a logo system, typography, color, art direction, and guidance for using them together." },
                    { title: "The website experience", body: "We translate the direction into page structure, custom design, and development. Your services, work, and inquiry experience should feel connected, with content that helps people understand the offer." },
                    { title: "Materials your team can use", body: "A brand needs to work beyond the launch presentation. We can extend the identity into guidelines, sales materials, illustration, and other agreed touchpoints that help the team apply it consistently." }
                ], link: { href: "/services/branding-identity-system/", label: "Explore our brand identity and strategy services" } },
            { type: "proof", id: "our-work", title: "Identity is more than a mark.", projects: [projects.mgny, projects.lumina] },
            { type: "rows", id: "right-size-the-work", label: "02 / Find the right scope", title: "Keep what works. Address what's changed.",
                items: [
                    { title: "A focused refresh", body: "Your positioning and recognition may still be strong, but the typography, imagery, or website feels inconsistent. A focused update can address those gaps without replacing the whole identity." },
                    { title: "A broader rebrand", body: "A changed audience, offer, or direction may call for deeper strategy and identity work. Start by agreeing what needs to change and what existing recognition is worth preserving." },
                    { title: "A brand and website engagement", body: "When both the identity and the site have fallen behind, developing them together can keep the story consistent. The investment and timeline depend on the scope, content, and rollout—not a one-size-fits-all package." }
                ] },
            { type: "checklist", id: "your-brief", label: "03 / Your starting point", title: "Tell us what has changed.",
                items: ["Where the business is today, and where you want to take it.", "The customers or audiences you need to reach next.", "What people currently misunderstand about your work.", "The parts of the existing brand you value—and the parts that no longer fit.", "Where the new identity needs to work: website, proposals, campaigns, or other materials."],
                note: "You don't need to decide whether it's a refresh or a rebrand before we talk. That is part of defining the right scope." }
        ],
        faqs: [
            { question: "Does Duo only design logos?", answer: "No. Our branding work can include strategy, messaging, visual identity, and how the identity extends into a website and other materials. We define the deliverables around the problem the business needs to solve." },
            { question: "Do we need to replace our existing logo?", answer: "Not necessarily. A useful brand review distinguishes what still works from what needs to change. The right scope may preserve the logo and focus on the wider visual system, messaging, or website." },
            { question: "Do you work outside Baltimore?", answer: "Yes. Duo is based in Baltimore and works with teams across the United States. We agree on communication, reviews, and any in-person needs when planning the engagement." },
            { question: "How much does a brand and website project cost?", answer: "It depends on whether you need a focused identity update or deeper strategy, messaging, and website work. Share the goals, deliverables, and budget range you have in mind; we will define the scope and investment before the project begins." }
        ],
        cta: { title: "Make the next chapter feel like you.", body: "Share what has changed in the business and where the current brand is falling short. We'll work out what needs attention and whether Duo is the right partner.", label: "Discuss your brand" },
        related: [links.web, links.choose]
    }
};

for (const guide of Object.values(guides)) {
    guide.faqSchema = JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: guide.faqs.map(({ question, answer }) => ({
            "@type": "Question", name: question,
            acceptedAnswer: { "@type": "Answer", text: answer }
        }))
    }).replace(/</g, "\\u003c");
}
module.exports = guides;
