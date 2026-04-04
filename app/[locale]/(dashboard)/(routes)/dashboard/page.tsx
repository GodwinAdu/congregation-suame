
import { currentUser } from '@/lib/helpers/session'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, BarChart3, BookOpen, ArrowRight, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'
import DashboardAnalytics from './_components/DashboardAnalytics'
import AttendantAnalytics from './_components/AttendantAnalytics'
import GroupAssistantAnalytics from './_components/GroupAssistantAnalytics'
import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import UniversalAnalytics from './_components/UniversalAnalytics'
import { requirePermission } from '@/lib/helpers/server-permission-check'
import { BackupModal } from './_components/BackupModal'

// Weekly Scripture Focus
const WEEKLY_FOCUS = [
  { week: 1, title: "Faith and Trust", verses: ["Hebrews 11:1", "Proverbs 3:5-6"], focus: "Developing unwavering faith in God's promises" },
  { week: 2, title: "Love and Compassion", verses: ["1 John 4:7-8", "Matthew 22:37-40"], focus: "Expressing God's love through our actions" },
  { week: 3, title: "Endurance and Perseverance", verses: ["James 1:2-4", "Galatians 6:9"], focus: "Remaining steadfast through trials" },
  { week: 4, title: "Wisdom and Understanding", verses: ["Proverbs 2:1-5", "James 1:5"], focus: "Seeking spiritual wisdom in daily decisions" },
  { week: 5, title: "Service and Humility", verses: ["1 Peter 4:10", "Philippians 2:3-4"], focus: "Using our gifts to serve others" },
  { week: 6, title: "Prayer and Communication", verses: ["1 Thessalonians 5:17", "Philippians 4:6-7"], focus: "Maintaining constant communication with God" },
  { week: 7, title: "Gratitude and Thanksgiving", verses: ["Colossians 3:15-17", "1 Thessalonians 5:18"], focus: "Cultivating a thankful heart in all circumstances" },
  { week: 8, title: "Forgiveness and Reconciliation", verses: ["Ephesians 4:31-32", "Matthew 18:21-22"], focus: "Extending forgiveness as Christ forgave us" },
  { week: 9, title: "Integrity and Honesty", verses: ["Proverbs 10:9", "Ephesians 4:25"], focus: "Living with truth and moral uprightness" },
  { week: 10, title: "Joy and Rejoicing", verses: ["Philippians 4:4", "Nehemiah 8:10"], focus: "Finding joy in God's presence and blessings" },
  { week: 11, title: "Patience and Gentleness", verses: ["Colossians 3:12", "Proverbs 14:29"], focus: "Responding with calm and kindness" },
  { week: 12, title: "Courage and Boldness", verses: ["Joshua 1:9", "2 Timothy 1:7"], focus: "Standing firm in faith without fear" },
  { week: 13, title: "Obedience and Submission", verses: ["1 Samuel 15:22", "Hebrews 13:17"], focus: "Following God's direction with willing hearts" },
  { week: 14, title: "Generosity and Giving", verses: ["2 Corinthians 9:7", "Proverbs 11:25"], focus: "Sharing blessings with a cheerful spirit" },
  { week: 15, title: "Humility and Meekness", verses: ["Matthew 5:5", "1 Peter 5:5-6"], focus: "Embracing a humble attitude before God" },
  { week: 16, title: "Righteousness and Holiness", verses: ["1 Peter 1:15-16", "Romans 6:19"], focus: "Pursuing a life set apart for God" },
  { week: 17, title: "Peace and Contentment", verses: ["Philippians 4:7", "1 Timothy 6:6"], focus: "Finding peace that surpasses understanding" },
  { week: 18, title: "Faithfulness and Loyalty", verses: ["Proverbs 28:20", "Revelation 2:10"], focus: "Remaining faithful through all seasons" },
  { week: 19, title: "Compassion and Mercy", verses: ["Matthew 9:36", "Colossians 3:12"], focus: "Showing tender care to those in need" },
  { week: 20, title: "Strength and Resilience", verses: ["Philippians 4:13", "Isaiah 40:31"], focus: "Drawing strength from God's power" },
  { week: 21, title: "Hope and Encouragement", verses: ["Romans 15:13", "Hebrews 10:23"], focus: "Anchoring our hope in God's promises" },
  { week: 22, title: "Discernment and Wisdom", verses: ["Proverbs 14:15", "James 3:17"], focus: "Developing spiritual insight and judgment" },
  { week: 23, title: "Dedication and Commitment", verses: ["Romans 12:1", "Deuteronomy 6:5"], focus: "Fully dedicating ourselves to God's service" },
  { week: 24, title: "Sanctification and Growth", verses: ["2 Peter 3:18", "1 Thessalonians 4:3"], focus: "Growing spiritually and becoming more Christ-like" },
  { week: 25, title: "Stewardship and Responsibility", verses: ["1 Peter 4:10", "Matthew 25:14-30"], focus: "Managing God's gifts with accountability" },
  { week: 26, title: "Redemption and Salvation", verses: ["Ephesians 1:7", "Romans 3:24"], focus: "Understanding the value of Christ's sacrifice" },
  { week: 27, title: "Transformation and Renewal", verses: ["Romans 12:2", "2 Corinthians 5:17"], focus: "Being transformed by the renewing of our minds" },
  { week: 28, title: "Testimony and Witness", verses: ["Matthew 5:16", "1 Peter 3:15"], focus: "Sharing our faith with conviction and love" },
  { week: 29, title: "Discipline and Self-Control", verses: ["1 Corinthians 9:25", "Titus 2:12"], focus: "Exercising spiritual discipline in daily life" },
  { week: 30, title: "Worship and Adoration", verses: ["John 4:24", "Psalm 95:6"], focus: "Offering genuine worship to our Creator" },
  { week: 31, title: "Guidance and Direction", verses: ["Proverbs 16:9", "Psalm 37:23"], focus: "Seeking God's direction for our paths" },
  { week: 32, title: "Healing and Restoration", verses: ["Psalm 147:3", "Isaiah 53:5"], focus: "Finding wholeness through God's grace" },
  { week: 33, title: "Provision and Trust", verses: ["Matthew 6:31-33", "Philippians 4:19"], focus: "Trusting God to provide all our needs" },
  { week: 34, title: "Protection and Security", verses: ["Psalm 91:1-2", "Proverbs 18:10"], focus: "Finding refuge in God's protective care" },
  { week: 35, title: "Celebration and Praise", verses: ["Psalm 100:1", "Philippians 4:4"], focus: "Expressing joy and gratitude to God" },
  { week: 36, title: "Accountability and Transparency", verses: ["Proverbs 27:12", "Ephesians 5:21"], focus: "Living with honesty and mutual accountability" },
  { week: 37, title: "Sacrifice and Surrender", verses: ["Romans 12:1", "Luke 9:23"], focus: "Surrendering our will to God's purpose" },
  { week: 38, title: "Community and Fellowship", verses: ["Hebrews 10:24-25", "1 John 1:7"], focus: "Building strong bonds with fellow believers" },
  { week: 39, title: "Conviction and Repentance", verses: ["2 Corinthians 7:10", "Acts 3:19"], focus: "Turning from sin with genuine remorse" },
  { week: 40, title: "Eternity and Perspective", verses: ["2 Corinthians 4:18", "Colossians 3:2"], focus: "Keeping eternal perspective in temporal matters" },
  { week: 41, title: "Mentorship and Discipleship", verses: ["2 Timothy 2:2", "Matthew 28:19-20"], focus: "Investing in the spiritual growth of others" },
  { week: 42, title: "Humility Before God", verses: ["James 4:6", "Proverbs 22:4"], focus: "Recognizing our dependence on God" },
  { week: 43, title: "Righteousness in Action", verses: ["James 2:26", "1 John 3:18"], focus: "Demonstrating faith through righteous deeds" },
  { week: 44, title: "Spiritual Warfare", verses: ["Ephesians 6:10-12", "2 Corinthians 10:4"], focus: "Standing firm against spiritual opposition" },
  { week: 45, title: "Restoration and Reconciliation", verses: ["2 Corinthians 5:18", "Matthew 5:23-24"], focus: "Seeking peace and healing in relationships" },
  { week: 46, title: "Eternal Life and Promise", verses: ["John 3:16", "1 John 5:11-12"], focus: "Embracing the hope of eternal life" },
  { week: 47, title: "Spiritual Maturity", verses: ["Ephesians 4:13", "Hebrews 5:12-14"], focus: "Growing toward spiritual completeness" },
  { week: 48, title: "Divine Love", verses: ["1 John 4:8", "Romans 5:8"], focus: "Understanding the depth of God's love" },
  { week: 49, title: "Obedience to Truth", verses: ["John 8:32", "3 John 1:4"], focus: "Living according to God's truth" },
  { week: 50, title: "Perseverance in Faith", verses: ["Hebrews 12:1-2", "Revelation 2:7"], focus: "Running the race with endurance" },
  { week: 51, title: "Gratitude in All Things", verses: ["1 Thessalonians 5:16-18", "Philippians 4:4-5"], focus: "Maintaining thankfulness in every season" },
  { week: 52, title: "New Beginnings", verses: ["2 Corinthians 5:17", "Revelation 21:5"], focus: "Embracing God's renewal and fresh starts" },
]

// Spiritual Highlights - Topical scriptures
const SPIRITUAL_HIGHLIGHTS = [
  { topic: "Prayer", verse: "Philippians 4:6-7", insight: "Prayer is the foundation of our relationship with God" },
  { topic: "Gratitude", verse: "Colossians 3:15-17", insight: "Thankfulness brings peace and strengthens our faith" },
  { topic: "Forgiveness", verse: "Ephesians 4:31-32", insight: "Forgiving others reflects God's mercy toward us" },
  { topic: "Integrity", verse: "Proverbs 10:9", insight: "Living with integrity builds trust and respect" },
  { topic: "Joy", verse: "Philippians 4:4", insight: "True joy comes from our relationship with God" },
  { topic: "Patience", verse: "Colossians 3:12", insight: "Patience demonstrates our trust in God's timing" },
  { topic: "Courage", verse: "Joshua 1:9", insight: "God's presence gives us courage to face challenges" },
  { topic: "Obedience", verse: "1 Samuel 15:22", insight: "Obedience to God is more valuable than sacrifice" },
  { topic: "Generosity", verse: "2 Corinthians 9:7", insight: "Giving with a cheerful heart brings blessings" },
  { topic: "Humility", verse: "Matthew 5:5", insight: "The humble inherit the earth and God's favor" },
  { topic: "Righteousness", verse: "1 Peter 1:15-16", insight: "We are called to live holy and set apart lives" },
  { topic: "Peace", verse: "Philippians 4:7", insight: "God's peace guards our hearts and minds" },
  { topic: "Faithfulness", verse: "Proverbs 28:20", insight: "Faithfulness brings abundant blessings" },
  { topic: "Compassion", verse: "Matthew 9:36", insight: "Jesus showed compassion to all who suffered" },
  { topic: "Strength", verse: "Philippians 4:13", insight: "Our strength comes through Christ who empowers us" },
  { topic: "Hope", verse: "Romans 15:13", insight: "Hope in God fills us with joy and peace" },
  { topic: "Discernment", verse: "Proverbs 14:15", insight: "Spiritual discernment helps us make wise choices" },
  { topic: "Dedication", verse: "Romans 12:1", insight: "Dedicating ourselves to God is our spiritual act of worship" },
  { topic: "Growth", verse: "2 Peter 3:18", insight: "Growing in grace and knowledge of Christ is essential" },
  { topic: "Stewardship", verse: "1 Peter 4:10", insight: "We are stewards of God's gifts and blessings" },
  { topic: "Redemption", verse: "Ephesians 1:7", insight: "Through Christ we have redemption and forgiveness" },
  { topic: "Transformation", verse: "Romans 12:2", insight: "God transforms us by renewing our minds" },
  { topic: "Testimony", verse: "Matthew 5:16", insight: "Our lives should reflect God's light to others" },
  { topic: "Discipline", verse: "1 Corinthians 9:25", insight: "Spiritual discipline leads to eternal rewards" },
  { topic: "Worship", verse: "John 4:24", insight: "True worship is in spirit and truth" },
  { topic: "Guidance", verse: "Proverbs 16:9", insight: "God directs our steps when we trust Him" },
  { topic: "Healing", verse: "Psalm 147:3", insight: "God heals the brokenhearted and binds our wounds" },
  { topic: "Provision", verse: "Matthew 6:31-33", insight: "God provides all we need when we seek His kingdom" },
  { topic: "Protection", verse: "Psalm 91:1-2", insight: "God is our refuge and fortress" },
  { topic: "Praise", verse: "Psalm 100:1", insight: "Praise opens our hearts to God's presence" },
  { topic: "Accountability", verse: "Proverbs 27:12", insight: "Accountability keeps us on the path of righteousness" },
  { topic: "Sacrifice", verse: "Romans 12:1", insight: "Surrendering our will is our living sacrifice" },
  { topic: "Community", verse: "Hebrews 10:24-25", insight: "Fellowship with believers strengthens our faith" },
  { topic: "Repentance", verse: "2 Corinthians 7:10", insight: "Godly sorrow leads to repentance and restoration" },
  { topic: "Eternity", verse: "2 Corinthians 4:18", insight: "Eternal perspective transforms how we live" },
  { topic: "Mentorship", verse: "2 Timothy 2:2", insight: "Investing in others multiplies God's kingdom" },
  { topic: "Dependence", verse: "James 4:6", insight: "God gives grace to the humble and dependent" },
  { topic: "Action", verse: "James 2:26", insight: "Faith without works is dead" },
  { topic: "Spiritual Armor", verse: "Ephesians 6:10-12", insight: "God equips us for spiritual battles" },
  { topic: "Reconciliation", verse: "2 Corinthians 5:18", insight: "God reconciles us to Himself through Christ" },
  { topic: "Eternal Life", verse: "John 3:16", insight: "God's love offers us eternal life" },
  { topic: "Maturity", verse: "Ephesians 4:13", insight: "Spiritual maturity comes through Christ" },
  { topic: "God's Love", verse: "1 John 4:8", insight: "God is love and desires relationship with us" },
  { topic: "Truth", verse: "John 8:32", insight: "God's truth sets us free" },
  { topic: "Endurance", verse: "Hebrews 12:1-2", insight: "We run the race with eyes fixed on Jesus" },
  { topic: "Thanksgiving", verse: "1 Thessalonians 5:16-18", insight: "Giving thanks in all circumstances pleases God" },
  { topic: "Renewal", verse: "2 Corinthians 5:17", insight: "In Christ we become new creations" },
  { topic: "Blessing", verse: "Proverbs 10:22", insight: "God's blessing brings true wealth" },
  { topic: "Confidence", verse: "Hebrews 10:35", insight: "Our confidence in God brings great reward" },
  { topic: "Surrender", verse: "Luke 9:23", insight: "Surrendering to God leads to true freedom" },
]

// New World Translation daily motivations
const NWT_MOTIVATIONS = [
  { verse: "Matthew 6:33", text: "Keep on, then, seeking first the Kingdom and his righteousness, and all these other things will be added to you." },
  { verse: "Psalm 46:1", text: "God is our refuge and strength, a help that is readily found in times of distress." },
  { verse: "Isaiah 41:10", text: "Do not be afraid, for I am with you. Do not be anxious, for I am your God. I will fortify you, yes, I will help you." },
  { verse: "Proverbs 3:5-6", text: "Trust in Jehovah with all your heart, and do not rely on your own understanding. In all your ways take notice of him, and he will make your paths straight." },
  { verse: "Philippians 4:13", text: "For all things I have the strength through the one who gives me power." },
  { verse: "Psalm 37:5", text: "Commit your way to Jehovah; rely on him, and he will act in your behalf." },
  { verse: "Romans 8:38-39", text: "Neither death nor life nor angels nor governments nor things present nor things to come nor powers nor height nor depth nor any other creation will be able to separate us from God's love." },
  { verse: "Joshua 1:9", text: "Be courageous and strong. Do not be struck with terror or fear, for Jehovah your God is with you wherever you go." },
  { verse: "Psalm 23:1", text: "Jehovah is my Shepherd. I will lack nothing." },
  { verse: "Isaiah 40:31", text: "Those hoping in Jehovah will regain power. They will soar on wings like eagles. They will run and not grow weary; they will walk and not tire out." },
  { verse: "Jeremiah 29:11", text: "'For I well know the thoughts that I am thinking toward you,' declares Jehovah, 'thoughts of peace, and not of calamity, to give you a future and a hope.'" },
  { verse: "Psalm 121:2", text: "My help comes from Jehovah, the Maker of heaven and earth." },
  { verse: "Matthew 11:28", text: "Come to me, all you who are toiling and loaded down, and I will refresh you." },
  { verse: "Philippians 4:6-7", text: "Do not be anxious over anything, but in everything by prayer and supplication along with thanksgiving, let your petitions be made known to God." },
  { verse: "Psalm 55:22", text: "Throw your burden on Jehovah, and he will sustain you. Never will he allow the righteous one to fall." },
  { verse: "2 Timothy 1:7", text: "God gave us not a spirit of cowardice, but one of power and of love and of soundness of mind." },
  { verse: "Psalm 34:18", text: "Jehovah is close to the brokenhearted; he saves those who are crushed in spirit." },
  { verse: "Romans 15:13", text: "May the God who gives hope fill you with all joy and peace by your trusting in him, so that you may abound in hope with power of holy spirit." },
  { verse: "Psalm 27:1", text: "Jehovah is my light and my salvation. Whom should I fear? Jehovah is the stronghold of my life. Whom should I dread?" },
  { verse: "Hebrews 13:6", text: "So that we may be of good courage and say: 'Jehovah is my helper; I will not be afraid. What can man do to me?'" },
  { verse: "Psalm 91:11", text: "For he will give his angels a command concerning you, to guard you in all your ways." },
  { verse: "Isaiah 26:3", text: "You will keep in perfect peace the one whose mind is steadfast, because he trusts in you." },
  { verse: "Psalm 145:18", text: "Jehovah is near to all those calling on him, to all who call on him in truth." },
  { verse: "1 Peter 5:7", text: "Throw all your anxiety on him, because he cares for you." },
  { verse: "Psalm 119:105", text: "Your word is a lamp to my foot, and a light for my path." },
  { verse: "Proverbs 18:10", text: "The name of Jehovah is a strong tower. Into it the righteous one runs and receives protection." },
  { verse: "Psalm 16:8", text: "I keep Jehovah before me constantly. Because he is at my right hand, I will never be shaken." },
  { verse: "Romans 12:12", text: "Rejoice in the hope. Endure under tribulation. Persevere in prayer." },
  { verse: "Psalm 62:8", text: "Trust in him at all times, O people. Pour out your hearts before him. God is a refuge for us." },
  { verse: "James 1:5", text: "If any one of you is lacking in wisdom, let him keep asking God, for he gives generously to all and without reproaching, and it will be given him." },
  { verse: "Psalm 73:28", text: "But as for me, drawing near to God is good for me. I have made the Sovereign Lord Jehovah my refuge." },
  { verse: "Zephaniah 3:17", text: "Jehovah your God is in your midst, a mighty one who will save. He will rejoice over you with great joy." },
  { verse: "Psalm 32:8", text: "I will give you insight and instruct you in the way you should go. I will give you advice with my eye upon you." },
  { verse: "Nahum 1:7", text: "Jehovah is good, a stronghold in the day of distress. He knows those who take refuge in him." },
  { verse: "Psalm 86:5", text: "For you, O Jehovah, are good and ready to forgive; you abound in loyal love for all those who call on you." },
  { verse: "Isaiah 43:2", text: "When you pass through the waters, I will be with you, and through the rivers, they will not flood over you." },
  { verse: "Psalm 103:13", text: "As a father shows mercy to his sons, Jehovah has shown mercy to those who fear him." },
  { verse: "Lamentations 3:22-23", text: "It is because of Jehovah's loyal love that we have not come to our end, for his mercies never end. They are new every morning." },
  { verse: "Psalm 138:7", text: "Though I walk in the midst of danger, you will preserve me alive. You will stretch out your hand against the anger of my enemies." },
  { verse: "Micah 7:7", text: "But as for me, I will keep watch for Jehovah. I will wait for the God of my salvation. My God will hear me." },
  { verse: "Psalm 18:2", text: "Jehovah is my crag and my stronghold and the one who rescues me. My God is my rock, in whom I take refuge." },
  { verse: "Habakkuk 3:19", text: "The Sovereign Lord Jehovah is my strength; he will make my feet like those of a deer and cause me to tread on high places." },
  { verse: "Psalm 56:3", text: "When I am afraid, I put my trust in you." },
  { verse: "Isaiah 30:21", text: "And your own ears will hear a word behind you saying, 'This is the way. Walk in it,' in case you should go to the right or in case you should go to the left." },
  { verse: "Psalm 147:3", text: "He heals the brokenhearted; he binds up their wounds." },
  { verse: "John 14:27", text: "I leave you peace; I give you my peace. I do not give it to you the way that the world gives it. Do not let your hearts be troubled nor let them shrink out of fear." },
  { verse: "Psalm 31:24", text: "Be courageous, and may your heart be strong, all you who are waiting for Jehovah." },
  { verse: "Romans 8:28", text: "We know that God makes all his works cooperate together for the good of those who love God, those who are the ones called according to his purpose." },
  { verse: "Psalm 9:9", text: "Jehovah will become a secure refuge for the oppressed, a secure refuge in times of distress." },
  { verse: "Revelation 21:4", text: "And he will wipe out every tear from their eyes, and death will be no more, neither will mourning nor outcry nor pain be anymore." },
  { verse: "Psalm 40:1-2", text: "I earnestly hoped in Jehovah, and he inclined his ear to me and heard my cry for help. He raised me up from a desolate pit." },
  { verse: "Isaiah 54:10", text: "'For the mountains may be removed and the hills may shake, but my loyal love for you will not be removed,' says Jehovah, who has mercy on you." },
  { verse: "Psalm 84:11", text: "For Jehovah God is a sun and a shield; Jehovah gives favor and glory. He will not withhold anything good from those walking in integrity." },
  { verse: "Colossians 3:2", text: "Keep your minds fixed on the things above, not on the things on the earth." },
  { verse: "Psalm 25:9", text: "He will guide the meek in what is right, and he will teach the meek ones his way." },
  { verse: "Galatians 6:9", text: "So let us not give up in doing what is fine, for in due time we will reap if we do not tire out." },
  { verse: "Psalm 37:23-24", text: "The steps of a man are made firm by Jehovah, and Jehovah takes pleasure in his way. Although he may fall, he will not be hurled down, for Jehovah supports him by the hand." },
  { verse: "Hebrews 10:23", text: "Let us hold firmly the public declaration of our hope without wavering, for the one who promised is faithful." },
  { verse: "Psalm 46:10", text: "Give in and know that I am God. I will be exalted among the nations; I will be exalted in the earth." },
  { verse: "1 Corinthians 10:13", text: "God is faithful, and he will not let you be tempted beyond what you can bear, but along with the temptation he will also make the way out so that you may be able to endure it." },
  { verse: "Psalm 71:5", text: "For you are my hope, O Sovereign Lord Jehovah, my confidence from my youth." },
  { verse: "Deuteronomy 31:8", text: "Jehovah himself will go ahead of you. He will be with you; he will neither desert you nor abandon you. Do not be afraid or be terrified." },
]

function getDailyMotivation() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  return NWT_MOTIVATIONS[dayOfYear % NWT_MOTIVATIONS.length]
}

function getWeeklyFocus() {
  const now = new Date()
  const weekOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24 * 7))
  return WEEKLY_FOCUS[weekOfYear % WEEKLY_FOCUS.length]
}

function getSpiritualHighlight() {
  const now = new Date()
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
  return SPIRITUAL_HIGHLIGHTS[dayOfYear % SPIRITUAL_HIGHLIGHTS.length]
}

const page = async () => {
  await requirePermission('dashboard')
  const user = await currentUser()
  const motivation = getDailyMotivation()
  const weeklyFocus = getWeeklyFocus()
  const highlight = getSpiritualHighlight()

  // Check user roles
  const isAdmin = user?.role === 'admin' || user?.role === 'coordinator'
  const isAttendant = user?.role === "attendant"
  const isGroupAssistant = user?.role === "group assistant(Attendant)"

  const hasAccess = isAdmin || isAttendant || isGroupAssistant

  if (!hasAccess) {
    const firstName = user?.fullName?.split(' ')[0] || 'Publisher'
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

    return (
      <div className="flex items-center justify-center min-h-[80vh] p-3 sm:p-6">
        <div className="w-full max-w-lg space-y-4">
          {/* Greeting */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{today}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">{greeting}, {firstName} 👋</h1>
          </div>

          {/* Daily Bible Motivation */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
            <CardHeader className="pb-2 relative">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-blue-200 text-xs font-medium uppercase tracking-wide">Daily Scripture</p>
                  <p className="text-white/70 text-xs">New World Translation</p>
                </div>
                <div className="ml-auto flex items-center gap-1 text-blue-200 text-xs">
                  <Calendar className="h-3 w-3" />
                  <span>Today</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative pb-5">
              <blockquote className="text-white text-base sm:text-lg font-medium leading-relaxed mb-4 italic">
                &ldquo;{motivation.text}&rdquo;
              </blockquote>
              <p className="text-blue-200 text-sm font-semibold">— {motivation.verse}</p>
            </CardContent>
          </Card>

          {/* Weekly Focus */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-600 to-pink-600 text-white overflow-hidden relative">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 -translate-x-8" />
            <CardHeader className="pb-2 relative">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-purple-200 text-xs font-medium uppercase tracking-wide">This Week's Focus</p>
                  <p className="text-white text-sm font-semibold">{weeklyFocus.title}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-white/90 text-sm mb-3">{weeklyFocus.focus}</p>
              <p className="text-purple-200 text-xs font-medium">Key Verses: {weeklyFocus.verses.join(', ')}</p>
            </CardContent>
          </Card>

          {/* Spiritual Highlight */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-600 to-teal-600 text-white overflow-hidden relative">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-y-8 translate-x-8" />
            <CardHeader className="pb-2 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-emerald-200 text-xs font-medium uppercase tracking-wide">Spiritual Highlight</p>
                    <p className="text-white text-sm font-semibold">{highlight.topic}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-white/90 text-sm mb-2">{highlight.insight}</p>
              <p className="text-emerald-200 text-xs font-medium">— {highlight.verse}</p>
            </CardContent>
          </Card>

          {/* Role info */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Shield className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-800">Dashboard Access</p>
                  <p className="text-xs text-orange-600 mt-0.5">This section is reserved for congregation leadership. Contact your group overseer for access.</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-orange-100 rounded text-xs text-orange-700 font-medium">
                    <span>Your role:</span>
                    <span className="capitalize">{user?.role?.replace(/_/g, ' ') || 'Publisher'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Publisher link */}
          <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base gap-2">
            <Link href="/dashboard/publisher">
              <BarChart3 className="h-4 w-4" />
              Go to My Publisher Dashboard
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // Determine which analytics to show based on role
  const getAnalyticsComponent = () => {
    if (isAdmin) {
      return <UniversalAnalytics />
    } else if (isGroupAssistant) {
      return <GroupAssistantAnalytics />
    } else if (isAttendant) {
      return <AttendantAnalytics />
    }
    return null
  }

  const getDashboardTitle = () => {
    if (isAdmin) return "Dashboard Analytics"
    if (isGroupAssistant) return "Group & Attendance Analytics"
    if (isAttendant) return "Attendance Analytics"
    return "Dashboard"
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <Heading title={getDashboardTitle()} />
        <div className="flex items-center gap-2">
          {isAdmin && <BackupModal />}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            {isAdmin ? "Full insights" : isGroupAssistant ? "Group insights" : "Attendance insights"}
          </div>
        </div>
      </div>
      <Separator />
      
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
            <CardHeader className="pb-2 relative">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-blue-200 text-xs font-medium uppercase tracking-wide">Daily Scripture</p>
                  <p className="text-white/70 text-xs">New World Translation</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <blockquote className="text-white text-sm font-medium leading-relaxed mb-3 italic">
                &ldquo;{motivation.text}&rdquo;
              </blockquote>
              <p className="text-blue-200 text-xs font-semibold">— {motivation.verse}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-600 to-pink-600 text-white overflow-hidden relative">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 -translate-x-8" />
            <CardHeader className="pb-2 relative">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-purple-200 text-xs font-medium uppercase tracking-wide">This Week's Focus</p>
                  <p className="text-white text-sm font-semibold">{weeklyFocus.title}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-white/90 text-xs mb-2">{weeklyFocus.focus}</p>
              <p className="text-purple-200 text-xs font-medium">Key Verses: {weeklyFocus.verses.join(', ')}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-600 to-teal-600 text-white overflow-hidden relative">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-y-8 translate-x-8" />
            <CardHeader className="pb-2 relative">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-emerald-200 text-xs font-medium uppercase tracking-wide">Spiritual Highlight</p>
                  <p className="text-white text-sm font-semibold">{highlight.topic}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-white/90 text-xs mb-2">{highlight.insight}</p>
              <p className="text-emerald-200 text-xs font-medium">— {highlight.verse}</p>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="py-2 sm:py-4">
        {getAnalyticsComponent()}
      </div>
    </>
  )
}

export default page
