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
        intro: "The right partner should understand your business, explain their decisions, and build a website your team can use. Here's what to look for beyond the portfolio.",
        contents: [{ id: "quick-answer", label: "Start here" }, { id: "what-to-look-for", label: "What to look for" }, { id: "our-work", label: "Project proof" }, { id: "first-call", label: "First call" }],
        answer: { title: "Look for a fit you can explain.", body: "Choose a web design partner whose experience, process, and project scope match what you need. Review live work, ask what the team actually delivered, and compare responsibilities as carefully as price. A strong visual direction matters, but so do content, usability, editing, and launch support." },
        sections: [
            { type: "rows", id: "what-to-look-for", label: "01 / Your shortlist", title: "Five things worth looking closely at.",
                items: [
                    { title: "Relevant problems, not just familiar industries", body: "A team may understand your challenge without having worked in your exact sector. Look for evidence of explaining complex services, organizing large content libraries, or supporting a considered purchase—whichever matters to your project." },
                    { title: "The live experience", body: "Use a few portfolio sites on your phone. Can you understand the offer, find useful information, and take the next step? Ask which parts of the work belong to the agency and what has changed since launch." },
                    { title: "Content and design working together", body: "Find out who owns the sitemap, page structure, messaging, copy, and assets. Strong design can't resolve a missing story if neither side has taken responsibility for writing it." },
                    { title: "A CMS your team can manage", body: "Ask to see how editors add a project, rearrange a page, or update a service. Reusable modules should give your team useful flexibility while preserving the design—not just a long list of settings." },
                    { title: "A clear working relationship", body: "Know who leads the project, who designs and develops it, and how feedback moves between teams. Ask about milestones, review rounds, testing, handoff, and support after launch." }
                ] },
            { type: "proof", id: "our-work", title: "Ask to see the thinking as well as the finish.", projects: [projects.africa, projects.genimex] },
            { type: "checklist", id: "first-call", label: "02 / First conversation", title: "Questions that get past the pitch.",
                items: ["Which project best demonstrates how you'd approach our challenge, and why?", "What would you need to learn before recommending a scope or platform?", "Who is responsible for content, approvals, and day-to-day communication?", "What does the CMS handoff look like for our team?", "What isn't included in the estimate, and how are changes handled?", "What will we own and have access to at launch?"],
                note: "Ask each shortlisted team the same core questions. It makes differences in approach easier to understand." },
            { type: "rows", id: "where-duo-fits", label: "03 / Where Duo fits", title: "Brand thinking. Design and development together.",
                intro: "Duo is a Baltimore-based design studio working with businesses and organizations on brand identity and custom marketing websites. Our work connects how a business explains itself with how people experience it online.",
                items: [
                    { title: "When we can help", body: "Your business has evolved, but the brand or website hasn't caught up. You need a clearer story, distinctive design, and a site built around your content and the people using it." },
                    { title: "What to clarify early", body: "If the main need is a complex software product, an ongoing advertising program, or outsourced ownership of your entire marketing function, say so at the outset. Those are different needs from a brand and marketing-website engagement." }
                ], link: { href: "/services/web-design-development/", label: "Explore our website services" } }
        ],
        faqs: [
            { question: "Should we only consider agencies in our industry?", answer: "Industry knowledge can help, but it is not the only sign of fit. Ask for work with similar audiences, content needs, buying journeys, or technical requirements. The team should be able to explain how that experience applies to your business." },
            { question: "Should we hire locally?", answer: "Choose locally if in-person collaboration is important to your team, and confirm which meetings will actually happen in person. A remote team can also work well when communication, decision-making, and availability are clear." },
            { question: "How should we compare proposals?", answer: "Compare deliverables, responsibilities, revision rounds, platform requirements, ownership, and post-launch support. Then compare price and timing against that shared scope. A lower total may cover a different amount of work." },
            { question: "Do we need a new brand before a new website?", answer: "Not always. A strong existing identity can guide the redesign. If the positioning, message, or visual identity no longer fits the business, discuss that early so the website is built on an agreed direction." }
        ],
        cta: { title: "See whether we're the right fit.", body: "Share your current site, what you want to change, and any budget or timing constraints. We'll start with the problem you're trying to solve.", label: "Start a conversation" },
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
